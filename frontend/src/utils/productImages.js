import { API_URL } from "../api";
import bagsImage from "../assets/category-icons/bags.png";
import banglesImage from "../assets/category-icons/bangles.png";
import braceletImage from "../assets/category-icons/bracelet.png";
import earringsImage from "../assets/category-icons/earrings.png";
import necklaceImage from "../assets/category-icons/necklace.png";
import ringsImage from "../assets/category-icons/rings.png";
import watchesImage from "../assets/category-icons/watches.png";

const categoryFallbackImages = {
  bags: bagsImage,
  bag: bagsImage,
  bangles: banglesImage,
  bangle: banglesImage,
  bracelet: braceletImage,
  bracelets: braceletImage,
  earrings: earringsImage,
  earring: earringsImage,
  necklace: necklaceImage,
  necklaces: necklaceImage,
  rings: ringsImage,
  ring: ringsImage,
  watch: watchesImage,
  watches: watchesImage,
};

const normalizeCategory = (category = "") =>
  category.toString().trim().toLowerCase();

export const getProductFallbackImage = (product = {}) =>
  categoryFallbackImages[normalizeCategory(product.category)] || banglesImage;

export const getProductImagePath = (product = {}, imageIndex = 0) => {
  if (product.images?.length > 0) {
    return product.images[imageIndex] || product.images[0];
  }

  return product.image || "";
};

export const getProductImageUrl = (product = {}, imageIndex = 0) => {
  const imagePath = getProductImagePath(product, imageIndex);

  if (!imagePath) {
    return getProductFallbackImage(product);
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  return imagePath.startsWith("/uploads/")
    ? `${API_URL}${imagePath}`
    : imagePath;
};
