import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase() || undefined;
  const normalizedPhone = phone?.trim() || undefined;

  if (!name || !password || (!normalizedEmail && !normalizedPhone)) {
    res.status(400);
    throw new Error("Please provide your name, password, and either email or phone number");
  }

  const duplicateChecks = [];
  if (normalizedEmail) {
    duplicateChecks.push({ email: normalizedEmail });
  }
  if (normalizedPhone) {
    duplicateChecks.push({ phone: normalizedPhone });
  }

  const existingUser = duplicateChecks.length
    ? await User.findOne({ $or: duplicateChecks })
    : null;

  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email or phone number already exists");
  }

  const userPayload = {
    name: name.trim(),
    password,
    ...(normalizedEmail && { email: normalizedEmail }),
    ...(normalizedPhone && { phone: normalizedPhone }),
  };

  const user = await User.create(userPayload);

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: "Welcome to Mahendergarh Imitation Jewellers",
      text: `Hello ${user.name}, your account has been created successfully.`,
      html: `<p>Hello <strong>${user.name}</strong>,</p><p>Your account has been created successfully.</p>`,
    });
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
    token: generateToken(user._id)
  });
};

const loginUser = async (req, res) => {
  const { identifier, email, phone, password } = req.body;
  const rawIdentifier = identifier || email || phone || "";
  const normalizedIdentifier = rawIdentifier.trim();
  const normalizedEmail = normalizedIdentifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedIdentifier }],
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const successMessage =
    "If this email is registered, a reset link request has been received. The email may take a moment to arrive.";

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      message: successMessage,
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  res.json({
    message: successMessage,
  });

  sendEmail({
    to: user.email,
    subject: "Reset your password",
    text: `Reset your password using this link: ${resetLink}`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  }).catch((error) => {
    console.error("Forgot password email failed:", error.message);
  });
};

const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};

export { registerUser, loginUser, getProfile, forgotPassword, resetPassword };
