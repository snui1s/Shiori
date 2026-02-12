import type { APIRoute } from "astro";
import { db, Post, User, eq, like, and, or, desc, sql } from "astro:db";
import { getSession } from "auth-astro/server";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "9");
  const offset = (page - 1) * limit;

  try {
    let conditions = [];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(Post.title, searchPattern),
          like(Post.excerpt, searchPattern),
          like(Post.content, searchPattern),
        ),
      );
    }

    if (category) conditions.push(eq(Post.category, category));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts
    const posts = await db
      .select()
      .from(Post)
      .where(whereClause)
      .orderBy(desc(Post.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(Post)
      .where(whereClause);

    const total = Number(totalCountResult[0].count);

    return new Response(
      JSON.stringify({
        posts: posts.map((p) => ({
          ...p,
          image: p.imageUrl, // Add image property for consistency
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Fetch posts error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  // 1. Check if user is logged in
  if (!session || !session.user?.email) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Please login first" }),
      { status: 401 },
    );
  }

  // 2. Fetch user from DB to verify role
  const dbUser = await db
    .select()
    .from(User)
    .where(eq(User.email, session.user.email))
    .get();

  const isOwner = session.user.email === import.meta.env.ADMIN_EMAIL;
  const isAdmin = dbUser?.role === "admin" || isOwner;

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
      status: 403,
    });
  }

  try {
    const data = await request.json();

    // แปลงชื่อ field จาก snake_case (จาก Editor) เป็น camelCase (ตาม DB)
    await db.insert(Post).values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      imageUrl: data.image_url || data.imageUrl,
      author: data.author || dbUser?.name || "Admin",
    });

    return new Response(JSON.stringify({ message: "Success" }), {
      status: 200,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Malformed JSON input" }), {
        status: 400,
      });
    }
    console.error("Post creation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
