import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      fullName: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      contact: String,
    },

    // 💳 Payment info
    paymentId: {
      type: String,
      default: "COD",
    },

    paymentMethod: {
      type: String,
      default: "COD", // card / upi / netbanking / cod
    },

    // 📦 Order status
    status: {
      type: String,
      enum: ["Placed", "Packed", "Shipped", "Delivered"],
      default: "Placed",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,
  },
  {
    timestamps: true, // ✅ gives createdAt & updatedAt
  },
);

export default mongoose.model("Order", orderSchema);
