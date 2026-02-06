export interface User {
  id?: string;
  name: string;
  email?: string;
  image: string;
  role?: string;
}

export interface Comment {
  id: number;
  parentId?: number | null;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
  replies?: Comment[];
}

export interface Post {
  id: string; // slug
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  category: string;
  image: string;
  author: string;
}
