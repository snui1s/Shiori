import type { APIRoute } from 'astro';
import { db, Post, eq } from 'astro:db';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response(JSON.stringify({ exists: false }), { status: 200 });
  }

  try {
    const existingPost = await db.select().from(Post).where(eq(Post.slug, slug)).get();
    return new Response(JSON.stringify({ exists: !!existingPost }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
}
