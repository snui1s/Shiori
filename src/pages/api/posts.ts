import type { APIRoute } from 'astro';
import { db, Post, User, eq } from 'astro:db';
import { getSession } from "auth-astro/server";

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  
  // 1. Check if user is logged in
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Please login first' }), { status: 401 });
  }

  // 2. Fetch user from DB to verify role
  const dbUser = await db.select().from(User).where(eq(User.email, session.user.email)).get();
  
  const isOwner = session.user.email === import.meta.env.ADMIN_EMAIL;
  const isAdmin = dbUser?.role === 'admin' || isOwner;

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden: Admin only' }), { status: 403 });
  }

  const data = await request.json();
  
  try {
    // แปลงชื่อ field จาก snake_case (จาก Editor) เป็น camelCase (ตาม DB)
    await db.insert(Post).values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      imageUrl: data.image_url || data.imageUrl,
      author: data.author || dbUser?.name || 'Admin'
    });

    return new Response(JSON.stringify({ message: 'Success' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
