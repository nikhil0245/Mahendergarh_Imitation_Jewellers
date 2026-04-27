import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ================= GET / CREATE CART =================
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

// ================= GET CART =================
const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json(cart);
};

// ================= ADD TO CART =================
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ProductId missing" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = await getOrCreateCart(req.user._id);

    // ✅ SAFE CHECK (NO CRASH)
    const existingItem = cart.items.find((item) => {
      if (!item.product) return false;

      return (
        (item.product._id?.toString() || item.product.toString()) === productId
      );
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + Number(quantity || 1);

      if (nextQuantity > product.countInStock) {
        return res.status(400).json({
          message: `Only ${product.countInStock} items available in stock`,
        });
      }

      existingItem.quantity = nextQuantity;
    } else {
      const nextQuantity = Number(quantity || 1);

      if (nextQuantity > product.countInStock) {
        return res.status(400).json({
          message: `Only ${product.countInStock} items available in stock`,
        });
      }

      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity: nextQuantity,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    res.status(201).json(updatedCart);
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE =================
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = await getOrCreateCart(req.user._id);

    const item = cart.items.find((cartItem) => {
      if (!cartItem.product) return false;

      return (
        (cartItem.product._id?.toString() || cartItem.product.toString()) ===
        req.params.productId
      );
    });

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (Number(quantity) > product.countInStock) {
      return res.status(400).json({
        message: `Only ${product.countInStock} items available in stock`,
      });
    }

    item.quantity = Number(quantity);
    cart.items = cart.items.filter((item) => item.quantity > 0);

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    res.json(updatedCart);
  } catch (err) {
    console.error("Update Cart Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE =================
const removeCartItem = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    cart.items = cart.items.filter((item) => {
      if (!item.product) return false;

      return (
        (item.product._id?.toString() || item.product.toString()) !==
        req.params.productId
      );
    });

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    res.json(updatedCart);
  } catch (err) {
    console.error("Remove Cart Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { getCart, addToCart, updateCartItem, removeCartItem };
