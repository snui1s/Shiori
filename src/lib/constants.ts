export const STORAGE_KEY = 'shiori_blog_draft';

export const CATEGORIES = [
  'Journal', 
  'Life', 
  'Review', 
  'Travel', 
  'Food', 
  'Thought', 
  'Tech', 
  'Work'
] as const;

export type Category = typeof CATEGORIES[number] | 'Other';
