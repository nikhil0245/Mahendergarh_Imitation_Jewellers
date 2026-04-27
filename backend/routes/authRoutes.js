import express from "express";
import {
  forgotPassword,
  getProfile,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/signup", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password/:token", asyncHandler(resetPassword));
router.get("/profile", protect, asyncHandler(getProfile));

export default router;
