import { db, PostComment, Post, User, eq, asc } from "astro:db";
import { getSession } from "auth-astro/server";
import type { APIRoute } from "astro";
import { validateCommentContent } from "../../lib/comments";

export const prerender = false;

// GET: Fetch comments for a post
export const GET: APIRoute = async ({ url }) => {
  const postIdParam = url.searchParams.get("postId");
  if (!postIdParam) {
    return new Response(JSON.stringify({ error: "Missing postId" }), { status: 400 });
  }

  const postIdValue = parseInt(postIdParam);
  if (isNaN(postIdValue)) {
    return new Response(JSON.stringify({ error: "Invalid postId" }), { status: 400 });
  }

  try {
    const data = await db
      .select({
        id: PostComment.id,
        parentId: PostComment.parentId,
        content: PostComment.content,
        createdAt: PostComment.createdAt,
        user: {
          name: User.name,
          image: User.image,
        },
      })
      .from(PostComment)
      .innerJoin(User, eq(PostComment.userId, User.id))
      .where(eq(PostComment.postId, postIdValue))
      .orderBy(asc(PostComment.createdAt));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
  }
};

// POST: Add a new comment or reply
export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const pId = parseInt(body.postId);
    const text = body.content as string;
    const parent = body.parentId ? parseInt(body.parentId) : null;

    // 1. Validation Logic
    const validation = validateCommentContent(text);
    if (!validation.isValid || isNaN(pId)) {
      return new Response(JSON.stringify({ error: validation.message || "Invalid input" }), { status: 400 });
    }

    // 2. Verify Post exists
    const [post] = await db.select().from(Post).where(eq(Post.id, pId));
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
    }

    // 3. Nesting Limit & Parent Check
    if (parent) {
      const parentComment = await db.select().from(PostComment).where(eq(PostComment.id, parent)).get();
      if (!parentComment) {
        return new Response(JSON.stringify({ error: "Parent comment not found" }), { status: 404 });
      }
      if (parentComment.postId !== pId) {
        return new Response(JSON.stringify({ error: "Invalid parent-post relationship" }), { status: 400 });
      }
      if (parentComment.parentId !== null) {
        return new Response(JSON.stringify({ error: "การตอบกลับจำกัดไว้ที่ 2 ชั้นเท่านั้น" }), { status: 400 });
      }
    }

    // 4. Ensure User exists and get ID
    let user = await db.select().from(User).where(eq(User.email, session.user.email)).get();
    
    if (!user) {
      try {
        const newId = crypto.randomUUID();
        const newUser = {
          id: newId,
          email: session.user.email as string,
          name: session.user.name || "Anonymous",
          image: session.user.image || "",
          role: "reader",
          createdAt: new Date(),
          password: null
        };
        await db.insert(User).values(newUser);
        user = newUser;
      } catch (insertErr) {
        user = await db.select().from(User).where(eq(User.email, session.user.email)).get();
      }
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "User profile could not be established" }), { status: 500 });
    }

    const inserted = await db.insert(PostComment).values({
      postId: pId,
      parentId: parent,
      userId: user.id,
      content: text,
    }).returning();

    return new Response(JSON.stringify(inserted[0]), { status: 200 });
  } catch (err: any) {
    console.error("Comment Error:", err);
    return new Response(JSON.stringify({ 
      error: "Database error", 
      details: err.message 
    }), { status: 500 });
  }
};
