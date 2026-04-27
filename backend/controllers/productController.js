import Product from "../models/Product.js";

// ================= GET ALL =================

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      sort = "",
      trending = "",
    } = req.query;
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let query = {};

    // 🔍 SEARCH (case-insensitive)
    if (safeSearch) {
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { category: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // 📂 CATEGORY FILTER
    if (safeCategory) {
      query.category = { $regex: `^${safeCategory}$`, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice !== "") {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice !== "") {
        query.price.$lte = Number(maxPrice);
      }
    }

    const sortMap = {
      latest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { rating: -1, createdAt: -1 },
    };

    if (trending === "true") {
      query.isTrending = true;
    }

    const sortQuery =
      trending === "true"
        ? { trendingAt: -1, updatedAt: -1, createdAt: -1 }
        : sortMap[sort] || { createdAt: -1 };

    const products = await Product.find(query).sort(sortQuery);

    res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const existingReview = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString(),
  );
  const reviewImagePaths = (req.files || []).map(
    (file) => `/uploads/${file.filename}`,
  );

  if (existingReview) {
    existingReview.rating = Number(rating);
    existingReview.comment = comment?.trim() || "";
    existingReview.name = req.user.name;
    if (reviewImagePaths.length > 0) {
      existingReview.images = reviewImagePaths;
      existingReview.image = reviewImagePaths[0];
    }
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment?.trim() || "",
      image: reviewImagePaths[0] || "",
      images: reviewImagePaths,
    });
  }

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum, review) => sum + review.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({ message: "Review saved successfully" });
};

const deleteProductReview = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own review");
  }

  review.deleteOne();

  product.numReviews = product.reviews.length;
  product.rating =
    product.numReviews > 0
      ? product.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        product.numReviews
      : 0;

  await product.save();

  res.json({ message: "Review deleted successfully" });
};

// ================= GET ONE =================
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
};

// ================= CREATE =================
const createProduct = async (req, res) => {
  const {
    name,
    price,
    originalPrice, // 🔥 ADD THIS
    description,
    category,
    material,
    color,
    countInStock,
    isTrending,
  } = req.body;

  const imagePaths = req.files
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : [];

  const product = new Product({
    name,
    price,
    originalPrice, // 🔥 SAVE THIS
    description,
    category,
    material,
    color,
    countInStock,
    isTrending: isTrending === "true" || isTrending === true,
    trendingAt:
      isTrending === "true" || isTrending === true ? new Date() : null,
    images: imagePaths,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// ================= UPDATE =================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const {
      name,
      price,
      originalPrice, // 🔥 ADD THIS
      description,
      category,
      material,
      color,
      countInStock,
      isTrending,
      retainedImages,
    } = req.body;

    product.name = name || product.name;
    product.price = price || product.price;

    // 🔥 UPDATE ORIGINAL PRICE
    if (originalPrice !== undefined) {
      product.originalPrice = originalPrice;
    }

    product.description = description || product.description;
    product.category = category || product.category;
    product.material = material || product.material;
    product.color = color || product.color;

    if (countInStock !== undefined) {
      product.countInStock = countInStock;
    }

    if (isTrending !== undefined) {
      const nextTrending = isTrending === "true" || isTrending === true;

      if (nextTrending && !product.isTrending) {
        product.trendingAt = new Date();
      } else if (!nextTrending) {
        product.trendingAt = null;
      }

      product.isTrending = nextTrending;
    }

    // 🔥 UPDATE IMAGES
    const keptImages = retainedImages ? JSON.parse(retainedImages) : product.images;

    if (req.files && req.files.length > 0) {
      product.images = [
        ...keptImages,
        ...req.files.map((file) => `/uploads/${file.filename}`),
      ];
    } else if (retainedImages !== undefined) {
      product.images = keptImages;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// ================= DELETE =================
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview,
};
