import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/orderRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import dotenv from "dotenv";
dotenv.config();
connectDB();

const app = express();
const envOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
  .filter(Boolean)
  .flatMap((value) => value.split(",").map((origin) => origin.trim()))
  .filter(Boolean);

const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://host.docker.internal:3000",
  "http://host.docker.internal:5000",
  "http://host.docker.internal:5001",
  "http://host.docker.internal:5173",
  "https://mahendargarh-imitation-jewellers.vercel.app",
  "https://mahendergarh-imitation-jewellers.vercel.app",
  ...envOrigins,
];

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/mahend(er|ar)garh-imitation-jewellers.*\.vercel\.app$/.test(
        origin,
      )
    ) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 204,
};

// 🔥 FIX __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARE =================
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// ================= STATIC FOLDER =================
// ✅ IMPORTANT (image serving fix)
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ================= ROUTES =================
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({ message: "mahendargarh API is running" });
});

// ================= ERROR =================
app.use(notFound);
app.use(errorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
