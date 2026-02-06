export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  // Strip HTML tags
  const text = content.replace(/<[^>]*>?/gm, '');
  // Count words (splitting by whitespace)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const time = Math.ceil(words / wordsPerMinute);
  return time || 1; // Minimum 1 minute
}
