import { db, Post } from 'astro:db';

export default async function seed() {
  const categories = ['Life', 'Review', 'Travel', 'Food', 'Thought'];
  const titles = [
    'คาเฟ่เปิดใหม่ที่อารีย์ บรรยากาศดีม้าก',
    'รีวิวกล้องฟิล์มตัวแรกในชีวิต',
    'ทำไมการตื่นเช้าถึงเปลี่ยนชีวิตฉัน',
    'ทริปเชียงใหม่คนเดียวฉบับงบประหยัด',
    'เมนูสุขภาพทำง่ายๆ ใน 10 นาที',
    'หนังสือที่อ่านแล้วอยากบอกต่อ',
    'มุมโปรดในห้องที่ทำให้มีความสุข',
    'เดินเล่นย่านพระนครยามเย็น',
    'วิธีจัดการความเครียดในฉบับของ Shiori',
    'ลองทำสปาเก็ตตี้คาโบนาร่าครั้งแรก',
    'แนะนำ Playlist ฟังตอนฝนตก',
    'สรุปสิ่งที่ได้เรียนรู้ในปีที่ผ่านมา',
    'พาไปดูนิทรรศการศิลปะใจกลางเมือง',
    'ต้นไม้ในบ้านที่ปลูกแล้วรอด!',
    'สกินแคร์รูทีนหน้าใสฉบับคนนอนน้อย',
    'ความสุขง่ายๆ ของการอยู่บ้าน',
    'ไปนวดหน้าผ่อนคลายที่สปาสุดหรู',
    'หัดวาดรูปสีน้ำวันหยุด',
    'จัดโต๊ะคอมใหม่ให้น่าทำงาน',
    'ก้าวต่อไปของ Shiori'
  ];

  const images = [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    'https://images.unsplash.com/photo-1452784444945-3f422708fe5e',
    'https://images.unsplash.com/photo-1506477331477-33d6d8b3dc85',
    'https://images.unsplash.com/photo-1518131683597-90a6042db682',
    'https://images.unsplash.com/photo-1528698853043-5df3b44ec6fa',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85',
    'https://images.unsplash.com/photo-1513519245088-0e12902e17ea',
    'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f',
    'https://images.unsplash.com/photo-1473093226795-af9932fe5856',
    'https://images.unsplash.com/photo-1514845505178-849c2358937a',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    'https://images.unsplash.com/photo-1501066927592-3ef7cc67e810',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858',
    'https://images.unsplash.com/photo-1519735815421-396564619965',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a'
  ];

  const posts = titles.map((title, i) => ({
    title: title,
    slug: `post-${i + 1}`,
    excerpt: `นี่คือคำโปรยบันทึกที่ ${i + 1} ของ Shiori เกี่ยวกับเรื่อง ${title} ลองมาอ่านกันดูนะจ๊ะ...`,
    content: `<p>เนื้อความบันทึกที่ ${i + 1} อันแสนนุ่มนวลและเป็นกันเอง...</p><p>เรื่องราวของ ${title} มันเริ่มจากที่ฉัน...</p><img src="${images[i]}" alt="${title}" />`,
    category: categories[i % categories.length],
    imageUrl: images[i],
    author: 'Shiori',
    createdAt: new Date(Date.now() - i * 3600000 * 24) // ลดหลั่นวันกันไปเพื่อทดสอบ Pagination
  }));

  await db.insert(Post).values(posts);
}
