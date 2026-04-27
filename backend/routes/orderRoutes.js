import express from "express";
import Order from "../models/orderModel.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// 🔥 CREATE ORDER
router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      shippingAddress,
      paymentId,
      paymentMethod,
      isPaid,
      paidAt,
      status,
    } = req.body;

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress?.fullName || "",
        email: shippingAddress?.email || req.user.email || "",
        address: shippingAddress?.address || "",
        city: shippingAddress?.city || "",
        state: shippingAddress?.state || "",
        pincode: shippingAddress?.pincode || "",
        contact: shippingAddress?.Contact || shippingAddress?.contact || "",
      },
      paymentId,
      paymentMethod,
      isPaid,
      paidAt,
      status: status || "Placed",
    });

    await order.save();

    await sendEmail({
      to: order.shippingAddress.email || req.user.email,
      subject: "Order confirmation",
      text: `Your order ${order._id} has been placed successfully.`,
      html: `<p>Your order <strong>#${order._id}</strong> has been placed successfully.</p><p>Total: ₹ ${order.totalAmount}</p>`,
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order save failed" });
  }
});

// 🔥 GET MY ORDERS
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 🔥 GET SINGLE ORDER
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email isAdmin",
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const isOwner = order.user?._id?.toString() === req.user._id.toString();

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// 🔥 UPDATE ORDER STATUS
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Placed", "Packed", "Shipped", "Delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// 🔥 GET ALL ORDERS (ADMIN)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
