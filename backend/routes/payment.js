import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const router = express.Router();

// ✅ Razorpay instance (FIXED)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET, // ✅ IMPORTANT FIX
});

// ==============================
// 🔥 CREATE ORDER
// ==============================
router.post("/create-order", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount missing" });
    }

    const options = {
      amount: Number(amount), // ✅ ensure number
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    console.log("ORDER:", order);

    res.json(order);
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({
      error: "Order creation failed",
      details: err.message,
    });
  }
});

// ==============================
// 🔐 VERIFY PAYMENT
// ==============================
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET) // ✅ FIXED
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
