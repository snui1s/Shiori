/**
 * Optimizes a Cloudinary URL by adding auto-format, auto-quality, and resizing parameters.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 */
export function getOptimizedImageUrl(url: string, width: number = 800) {
  if (!url) return url;
  
  // Check if it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    // Cloudinary transformation pattern usually follows /upload/v12345678/path
    // We insert transformations after /upload/
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // f_auto: auto format (WebP/AVIF)
      // q_auto: auto quality
      // w_800: resize to specific width
      // c_limit: don't upscale if smaller
      return `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]}`;
    }
  }
  
  return url;
}
