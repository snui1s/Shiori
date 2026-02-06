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

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    password: column.text({ optional: true }),
    name: column.text({ optional: true }),
    image: column.text({ optional: true }),
    role: column.text({ default: 'reader' }),
    createdAt: column.date({ default: NOW }),
  }
});

const PostComment = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    postId: column.number({ 
      references: () => Post.columns.id,
      onDelete: 'cascade' 
    }),
    parentId: column.number({ 
      optional: true,
      onDelete: 'cascade'
    }),
    userId: column.text({ 
      references: () => User.columns.id,
      onDelete: 'cascade'
    }),
    content: column.text(),
    createdAt: column.date({ default: NOW }),
  }
});

export default defineDb({
  tables: { Post, User, PostComment }
});
