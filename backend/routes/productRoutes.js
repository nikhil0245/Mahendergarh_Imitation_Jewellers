import express from "express";
import {
  createProductReview,
  createProduct,
  deleteProductReview,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ================= ROUTES =================

router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProductById));
router.post(
  "/:id/reviews",
  protect,
  upload.array("images", 5),
  asyncHandler(createProductReview),
);
router.delete(
  "/:id/reviews/:reviewId",
  protect,
  asyncHandler(deleteProductReview),
);

// 🔥 MULTIPLE IMAGE UPLOAD
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5), // 🔥 CHANGE
  asyncHandler(createProduct),
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5), // 🔥 CHANGE
  asyncHandler(updateProduct),
);

router.delete("/:id", protect, adminOnly, asyncHandler(deleteProduct));

export default router;
