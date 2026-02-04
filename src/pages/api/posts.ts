import type { APIRoute } from 'astro';
import { db, Post } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  
  try {
    // แปลงชื่อ field จาก snake_case (จาก Editor) เป็น camelCase (ตาม DB)
    await db.insert(Post).values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      imageUrl: data.image_url,
      author: 'Shiori'
    });

    return new Response(JSON.stringify({ message: 'Success' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
