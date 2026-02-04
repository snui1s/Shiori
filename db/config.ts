import { defineDb, defineTable, column, NOW } from 'astro:db';

const Post = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    slug: column.text({ unique: true }),
    excerpt: column.text({ optional: true }),
    content: column.text({ optional: true }),
    imageUrl: column.text({ optional: true }),
    category: column.text({ default: 'Journal' }),
    author: column.text({ default: 'Shiori' }),
    createdAt: column.date({ default: NOW }),
  }
});

export default defineDb({
  tables: { Post }
});
