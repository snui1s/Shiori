/**
 * Produce an optimized Cloudinary image URL by adding format, quality, and resize transformations when applicable.
 *
 * @param url - The original image URL to optimize.
 * @param width - Desired maximum image width to request from Cloudinary (defaults to 800).
 * @returns The transformed Cloudinary URL with `f_auto,q_auto,w_<width>,c_limit` inserted when the input is a Cloudinary `/upload/` URL that does not already include `f_auto`; otherwise returns the original `url`.
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
 * Optimize Cloudinary <img> tags found in an HTML string.
 *
 * Replaces Cloudinary image `src` values with optimized URLs (w=1000) and ensures
 * each `<img>` includes `loading="lazy"` and `decoding="async"` when not present.
 *
 * @param html - The HTML content to process
 * @returns The input HTML with Cloudinary `<img>` `src` attributes optimized and missing `loading`/`decoding` attributes added
 */
export function getOptimizedContentHtml(html: string) {
  if (!html) return html;

  // Regex to find <img> tags and extract their src
  return html.replace(
    /<img\s+([^>]*?)src=(['"])([^'"]+)\2([^>]*?)>/gi,
    (match, before, quote, src, after) => {
      const optimizedSrc = getOptimizedImageUrl(src, 1000); // Higher width for content images

      // Ensure loading="lazy" and decoding="async" are present if not already
      let newTag = `<img ${before}src="${optimizedSrc}"${after}`;
      if (!newTag.includes('loading="')) {
        newTag = newTag.replace("<img ", '<img loading="lazy" ');
      }
      if (!newTag.includes('decoding="')) {
        newTag = newTag.replace("<img ", '<img decoding="async" ');
      }

      return newTag + ">";
    },
  );
}