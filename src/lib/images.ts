/**
 * Optimize a Cloudinary image URL by adding auto-format, auto-quality, and width constraints.
 *
 * If `url` is falsy, not a Cloudinary URL, or already contains `f_auto` transformations, the original `url` is returned unchanged.
 *
 * @param url - The image URL to optimize
 * @param width - Maximum width in pixels to request from Cloudinary (defaults to 800)
 * @returns The transformed Cloudinary URL with `f_auto,q_auto,w_<width>,c_limit` inserted, or the original `url` if no transformation was applied
 */
export function getOptimizedImageUrl(url: string, width: number = 800) {
  if (!url) return url;

  // Check if it's a Cloudinary URL
  if (url.includes("res.cloudinary.com")) {
    // Check if it already has transformations
    if (url.includes("/upload/") && !url.includes("/upload/f_auto")) {
      const parts = url.split("/upload/");
      if (parts.length === 2) {
        // f_auto: auto format (WebP/AVIF)
        // q_auto: auto quality
        // w_800: resize to specific width
        // c_limit: don't upscale if smaller
        return `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]}`;
      }
    }
  }

  return url;
}

/**
 * Optimize Cloudinary <img> elements in HTML by replacing their `src` with optimized Cloudinary URLs and ensuring `loading="lazy"` and `decoding="async"` attributes.
 *
 * @param html - HTML string to process; if falsy, the input is returned unchanged.
 * @returns The transformed HTML with optimized Cloudinary image sources and added attributes.
 */
export function getOptimizedContentHtml(html: string) {
  if (!html) return html;

  // Regex to find <img> tags and extract their src
  return html.replace(
    /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/gi,
    (match, before, src, after) => {
      const optimizedSrc = getOptimizedImageUrl(src, 1000); // Higher width for content images

      // Ensure loading="lazy" and decoding="async" are present if not already
      let newTag = `<img ${before}src="${optimizedSrc}"${after}`;
      if (!newTag.includes('loading="')) {
        newTag = newTag.replace("<img ", '<img loading="lazy" ');
      }
      if (!newTag.includes('decoding="')) {
        newTag = newTag.replace("<img ", '<img decoding="async" ');
      }

      return newTag;
    },
  );
}