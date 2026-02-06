import type { APIRoute } from 'astro';
import { db, Post, User, eq } from 'astro:db';
import { getSession } from "auth-astro/server";

async function isAuthorized(request: Request) {
  const session = await getSession(request);
  if (!session || !session.user?.email) return false;
  
  const dbUser = await db.select().from(User).where(eq(User.email, session.user.email)).get();
  const isOwner = session.user.email === import.meta.env.ADMIN_EMAIL;
  return dbUser?.role === 'admin' || isOwner;
}

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response(null, { status: 400 });

  try {
    const post = await db.select().from(Post).where(eq(Post.slug, id)).get();
    if (!post) return new Response(null, { status: 404 });
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export const PATCH: APIRoute = async ({ params, request }) => {
  if (!await isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { id } = params;
  if (!id) return new Response(null, { status: 400 });
  
  const data = await request.json();

  try {
    await db.update(Post)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        imageUrl: data.image_url,
        author: data.author
      })
      .where(eq(Post.slug, id));

    return new Response(JSON.stringify({ message: 'Updated successfully' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!await isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { id } = params;
  if (!id) return new Response(null, { status: 400 });

  try {
    await db.delete(Post).where(eq(Post.slug, id));
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
