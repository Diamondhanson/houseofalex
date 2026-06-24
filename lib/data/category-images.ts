// Local rotating images per category (served from /public).
// Categories not listed fall back to their single DB image / placeholder.
export const CATEGORY_IMAGES: Record<string, string[]> = {
  "arabic-perfumes": ["/categories/arabic-perfumes-1.jpg", "/categories/arabic-perfumes-2.jpg"],
  "bags": ["/categories/bags-1.jpg", "/categories/bags-2.jpg", "/categories/bags-3.jpg"],
  "body-mist": ["/categories/body-mist-1.jpg", "/categories/body-mist-2.jpg", "/categories/body-mist-3.jpg"],
  "clothing": ["/categories/clothing-1.jpg", "/categories/clothing-2.jpg", "/categories/clothing-3.jpg"],
  "electronics": ["/categories/electronics-1.jpg", "/categories/electronics-2.jpg", "/categories/electronics-3.jpg"],
  "makeup": ["/categories/makeup-1.jpg", "/categories/makeup-2.jpg", "/categories/makeup-3.jpg"],
  "perfume-full": ["/categories/perfume-full-1.jpg", "/categories/perfume-full-2.jpg", "/categories/perfume-full-3.jpg"],
  "perfume-mini": ["/categories/perfume-mini-1.jpg", "/categories/perfume-mini-2.jpg", "/categories/perfume-mini-3.jpg"],
  "shoes": ["/categories/shoes-1.jpg", "/categories/shoes-2.jpg"],
  "stanley-cups": ["/categories/stanley-cups-1.jpg", "/categories/stanley-cups-2.jpg", "/categories/stanley-cups-3.jpg"],
  "toys": ["/categories/toys-1.jpg", "/categories/toys-2.jpg", "/categories/toys-3.jpg"],
};
