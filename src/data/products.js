// Images live in public/image/ and are served from /image/...

export const testimonials = [
  {
    quote:
      "Stay cool, stay trendy with shirts. Your ultimate fashion essential. Unleash your creativity, be bold, and express yourself with the perfect fit for your personality.",
    name: "Branded Shirts",
    designation: "Shirts collection",
    src: "/image/Shirts/shirts.jpeg"
  },
  {
    quote:
      "Elevate your style, suit up with confidence. Tailored for success, dressed for greatness.",
    name: "Suits for Men",
    designation: "Suits collection",
    src: "/image/Suits/suits4.jfif"
  },
  {
    quote:
      "Stay cozy, stay stylish with our hoodies. Wrap yourself in comfort, chase the chill, and unleash your style with our signature hoodies.",
    name: "Hoodies",
    designation: "Hoodies collection",
    src: "/image/Hoodies/Hoodie.jpeg"
  },
  {
    quote:
      "From casual to classy, we've got your pants. Adapt to every mood with versatile pants that redefine comfort and style. Perfect fit, perfect style.",
    name: "Men's Casual Trousers",
    designation: "Trousers collection",
    src: "/image/Trousers/trouser5.jfif"
  },
  {
    quote:
      "From casual to classy, we've got your pants. Adapt to every mood with versatile pants that redefine comfort and style. Perfect fit, perfect style.",
    name: "Men's Summer Shorts",
    designation: "Shorts collection",
    src: "/image/Shorts/shorts3.jfif"
  }
];

// Each category decides which size list and colours its products offer
export const CATEGORY_CONFIG = {
  Hoodies: { sizes: "top", colors: ["Black", "Navy", "Grey", "Maroon"], text: "Warm, soft hoodies for men" },
  Shirts: { sizes: "top", colors: ["White", "Blue", "Black", "Beige"], text: "Casual and formal shirts for men" },
  "T-Shirts": { sizes: "top", colors: ["Black", "White", "Navy", "Olive"], text: "Comfortable everyday t-shirts for men" },
  Pants: { sizes: "bottom", colors: ["Black", "Navy", "Olive", "Beige"], text: "Casual pants with a comfortable fit" },
  Trousers: { sizes: "bottom", colors: ["Black", "Grey", "Navy", "Beige"], text: "Smart trousers for work and occasions" },
  Shorts: { sizes: "bottom", colors: ["Black", "Navy", "Olive", "Grey"], text: "Light shorts for warm days" },
  Suits: { sizes: "bottom", colors: ["Black", "Navy", "Olive", "Grey"], text: "Elevate your style, suit up with confidence." },
  Combos: { sizes: "top", colors: ["Black", "Navy", "Grey"], text: "Matching shirt and pant combo for men" }
};

export const SIZE_LISTS = {
  top: ["S", "M", "L", "XL", "XXL"],
  bottom: ["28", "30", "32", "34", "36"]
};

export const COLOR_HEX = {
  Black: "#111827", White: "#f9fafb", Navy: "#1e3a8a", Grey: "#6b7280",
  Olive: "#556b2f", Maroon: "#7f1d1d", Beige: "#d6c7a1", Blue: "#2563eb"
};

// price is in rupees
export const products = [
  { id: 1,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie.jpeg", title: "Hoodies", price: 699, reviews: "5K Reviews" },
  { id: 2,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie1.webp", title: "Hoodies", price: 599, reviews: "5K Reviews" },
  { id: 3,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie2.jpeg", title: "Hoodies", price: 599, reviews: "5K Reviews" },
  { id: 4,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie3.jpeg", title: "Hoodies", price: 699, reviews: "2K Reviews" },
  { id: 5,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie4.jpeg", title: "Hoodies", price: 499, reviews: "3K Reviews" },
  { id: 6,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie5.jpeg", title: "Hoodies", price: 499, reviews: "5K Reviews" },
  { id: 7,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie6.jpeg", title: "Hoodies", price: 599, reviews: "5K Reviews" },
  { id: 8,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie7.jpeg", title: "Hoodies", price: 599, reviews: "4K Reviews" },
  { id: 9,  category: "Hoodies", img_path: "/image/Hoodies/Hoodie8.jpeg", title: "Hoodies", price: 799, reviews: "2K Reviews" },
  { id: 10, category: "Hoodies", img_path: "/image/Hoodies/Hoodie9.jpeg", title: "Hoodies", price: 699, reviews: "2K Reviews" },
  { id: 11, category: "Hoodies", img_path: "/image/Hoodies/Hoodie10.jpeg", title: "Hoodies", price: 699, reviews: "2K Reviews" },
  { id: 12, category: "Hoodies", img_path: "/image/Hoodies/Hoodie11.jpeg", title: "Hoodies", price: 499, reviews: "2K Reviews" },
  { id: 13, category: "Hoodies", img_path: "/image/Hoodies/Hoodie12.jfif", title: "Hoodies", price: 799, reviews: "2K Reviews" },
  { id: 14, category: "Hoodies", img_path: "/image/Hoodies/Hoodie13.jfif", title: "Hoodies", price: 799, reviews: "2K Reviews" },
  { id: 15, category: "Hoodies", img_path: "/image/Hoodies/Hoodie14.jfif", title: "Hoodies", price: 799, reviews: "2K Reviews" },
  { id: 16, category: "Shirts", img_path: "/image/Shirts/shirts.jpeg", title: "Shirts", price: 399, reviews: "3K Reviews" },
  { id: 17, category: "Shirts", img_path: "/image/Shirts/shirts1.jpeg", title: "Shirts", price: 299, reviews: "7K Reviews" },
  { id: 18, category: "Shirts", img_path: "/image/Shirts/shirts2.jpeg", title: "Shirts", price: 299, reviews: "3K Reviews" },
  { id: 19, category: "Shirts", img_path: "/image/Shirts/shirts3.jpeg", title: "Shirts", price: 399, reviews: "3K Reviews" },
  { id: 20, category: "Shirts", img_path: "/image/Shirts/shirts4.jpeg", title: "Shirts", price: 299, reviews: "3K Reviews" },
  { id: 21, category: "Shirts", img_path: "/image/Shirts/shirts5.jpeg", title: "Shirts", price: 399, reviews: "3K Reviews" },
  { id: 22, category: "Shirts", img_path: "/image/Shirts/shirts6.jpeg", title: "Shirts", price: 399, reviews: "3K Reviews" },
  { id: 23, category: "Shirts", img_path: "/image/Shirts/shirts7.jpeg", title: "Shirts", price: 399, reviews: "3K Reviews" },
  { id: 24, category: "Shirts", img_path: "/image/Shirts/shirts8.jpeg", title: "Shirts", price: 499, reviews: "3K Reviews" },
  { id: 25, category: "Shirts", img_path: "/image/Shirts/shirts9.jfif", title: "Shirts", price: 399, reviews: "3K Reviews" },
  { id: 26, category: "T-Shirts", img_path: "/image/T-shirts/t-shirt.jpg", title: "T-Shirts", price: 299, reviews: "3K Reviews" },
  { id: 27, category: "T-Shirts", img_path: "/image/T-shirts/t-shirt1.jpg", title: "T-Shirts", price: 299, reviews: "3K Reviews" },
  { id: 28, category: "T-Shirts", img_path: "", title: "T-Shirts", price: 200, reviews: "5K Reviews" },
  { id: 29, category: "T-Shirts", img_path: "", title: "T-Shirts", price: 200, reviews: "5K Reviews" },
  { id: 30, category: "T-Shirts", img_path: "", title: "T-Shirts", price: 200, reviews: "5K Reviews" },
  { id: 31, category: "Pants", img_path: "/image/Pants/pant.jfif", title: "Casual Pants", price: 499, reviews: "2K Reviews" },
  { id: 32, category: "Pants", img_path: "/image/Pants/pant1.jpeg", title: "Casual Pants", price: 499, reviews: "1K Reviews" },
  { id: 33, category: "Pants", img_path: "", title: "Casual Pants", price: 250, reviews: "1K Reviews" },
  { id: 34, category: "Pants", img_path: "", title: "Casual Pants", price: 250, reviews: "1K Reviews" },
  { id: 35, category: "Pants", img_path: "", title: "Casual Pants", price: 250, reviews: "1K Reviews" },
  { id: 36, category: "Trousers", img_path: "/image/Trousers/trouser1.jfif", title: "Formal Trousers", price: 399, reviews: "2K Reviews" },
  { id: 37, category: "Trousers", img_path: "/image/Trousers/trouser2.jfif", title: "Formal Trousers", price: 499, reviews: "1K Reviews" },
  { id: 38, category: "Trousers", img_path: "/image/Trousers/trouser3.jfif", title: "Formal Trousers", price: 399, reviews: "1K Reviews" },
  { id: 39, category: "Trousers", img_path: "/image/Trousers/trouser4.jfif", title: "Formal Trousers", price: 499, reviews: "1K Reviews" },
  { id: 40, category: "Trousers", img_path: "/image/Trousers/trouser5.jfif", title: "Formal Trousers", price: 599, reviews: "1K Reviews" },
  { id: 41, category: "Shorts", img_path: "/image/Shorts/shorts1.jfif", title: "Summer Shorts", price: 150, reviews: "1K Reviews" },
  { id: 42, category: "Shorts", img_path: "/image/Shorts/shorts2.jfif", title: "Summer Shorts", price: 150, reviews: "900 Reviews" },
  { id: 43, category: "Shorts", img_path: "/image/Shorts/shorts3.jfif", title: "Summer Shorts", price: 150, reviews: "900 Reviews" },
  { id: 44, category: "Shorts", img_path: "/image/Shorts/shorts4.jfif", title: "Summer Shorts", price: 150, reviews: "900 Reviews" },
  { id: 45, category: "Shorts", img_path: "/image/Shorts/shorts5.jfif", title: "Summer Shorts", price: 150, reviews: "900 Reviews" },
  { id: 46, category: "Suits", img_path: "/image/Suits/suits.jpeg", title: "Suits For Men", price: 2999, reviews: "900 Reviews" },
  { id: 47, category: "Suits", img_path: "/image/Suits/suits1.jpeg", title: "Suits For Men", price: 2999, reviews: "900 Reviews" },
  { id: 48, category: "Suits", img_path: "/image/Suits/suits2.jfif", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 49, category: "Suits", img_path: "/image/Suits/suits3.jfif", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 50, category: "Suits", img_path: "/image/Suits/suits4.jfif", title: "Suits For Men", price: 4999, reviews: "900 Reviews" },
  { id: 51, category: "Suits", img_path: "/image/Suits/suits5.jfif", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 52, category: "Suits", img_path: "/image/Suits/suits6.jfif", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 53, category: "Suits", img_path: "/image/Suits/suits7.jfif", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 54, category: "Suits", img_path: "/image/Suits/suits8.jfif", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 55, category: "Suits", img_path: "", title: "Suits For Men", price: 3999, reviews: "900 Reviews" },
  { id: 56, category: "Combos", img_path: "/image/Combos/hoodie combo1.jfif", title: "Hoodie Combo", price: 999, reviews: "5K Reviews" },
  { id: 57, category: "Combos", img_path: "/image/Combos/hoodie combo2.jfif", title: "Hoodie Combo", price: 999, reviews: "4K Reviews" },
  { id: 58, category: "Combos", img_path: "/image/Combos/shirt combo.jfif", title: "Shirts and Pant Combo", price: 699, reviews: "4K Reviews" },
  { id: 59, category: "Combos", img_path: "/image/Combos/shirt combo1.jfif", title: "Shirts and Pant Combo", price: 899, reviews: "4K Reviews" },
  { id: 60, category: "Combos", img_path: "/image/Combos/shirt combo2.jfif", title: "Shirts and Pant Combo", price: 899, reviews: "4K Reviews" },
  { id: 61, category: "Combos", img_path: "/image/Combos/shirt combo3.jfif", title: "Shirts and Pant Combo", price: 799, reviews: "4K Reviews" },
  { id: 62, category: "Combos", img_path: "/image/Combos/shirts combo4.jpeg", title: "Shirts and Pant Combo", price: 799, reviews: "4K Reviews" },
  { id: 63, category: "Combos", img_path: "/image/Combos/shirts combo5.jpeg", title: "Shirts and Pant Combo", price: 999, reviews: "4K Reviews" },
  { id: 64, category: "Combos", img_path: "/image/Combos/t-shirt combo.jfif", title: "Shirts and Pant Combo", price: 999, reviews: "4K Reviews" },
  { id: 65, category: "Combos", img_path: "/image/Combos/t-shirt3.jpeg", title: "Shirts and Pant Combo", price: 699, reviews: "4K Reviews" },
  { id: 66, category: "Combos", img_path: "/image/Combos/t-shirt and shorts1.jfif", title: "T-Shirts Combo", price: 599, reviews: "4K Reviews" },
  { id: 67, category: "Combos", img_path: "/image/Combos/t-shirt and shorts2.jfif", title: "T-Shirts Combo", price: 599, reviews: "4K Reviews" },
  { id: 68, category: "Combos", img_path: "/image/Combos/t-shirt and shorts3.jfif", title: "T-Shirts Combo", price: 599, reviews: "4K Reviews" },
  { id: 69, category: "Combos", img_path: "/image/Combos/shorts combo1.jfif", title: "Shorts Combo", price: 399, reviews: "4K Reviews" },
  { id: 70, category: "Combos", img_path: "/image/Combos/shorts combo2.jfif", title: "Shorts Combo", price: 399, reviews: "4K Reviews" }
];
