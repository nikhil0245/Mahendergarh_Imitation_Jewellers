import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Cart from "./models/Cart.js";
import sampleProducts from "./data/sampleProducts.js";

dotenv.config();

const ADMIN_EMAIL = "admin@mahendergarh.com";

const normalizeProduct = (product) => {
  const { image, images, ...rest } = product;
  const normalizedImages = Array.isArray(images) && images.length > 0
    ? images
    : image
      ? [image]
      : [];

  return {
    ...rest,
    images: normalizedImages,
  };
};

const upsertAdmin = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: "Admin User",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const upsertSampleProducts = async () => {
  let createdCount = 0;
  let updatedCount = 0;
  let removedDuplicateCount = 0;

  for (const sampleProduct of sampleProducts) {
    const productData = normalizeProduct(sampleProduct);
    const existingProducts = await Product.find({ name: productData.name }).sort({
      createdAt: 1,
      _id: 1,
    });

    if (existingProducts.length === 0) {
      await Product.create(productData);
      createdCount += 1;
      continue;
    }

    const [productToUpdate, ...duplicates] = existingProducts;
    productToUpdate.set(productData);
    await productToUpdate.save();
    updatedCount += 1;

    if (duplicates.length > 0) {
      await Product.deleteMany({
        _id: { $in: duplicates.map((product) => product._id) },
      });
      removedDuplicateCount += duplicates.length;
    }
  }

  return { createdCount, updatedCount, removedDuplicateCount };
};

const importData = async () => {
  await upsertAdmin();
  const { createdCount, updatedCount, removedDuplicateCount } =
    await upsertSampleProducts();

  console.log("Sample data synced successfully");
  console.log(`Products created: ${createdCount}`);
  console.log(`Products updated: ${updatedCount}`);
  console.log(`Duplicate sample products removed: ${removedDuplicateCount}`);
  console.log(`Admin login: ${ADMIN_EMAIL} / 123456`);
};

const destroyData = async () => {
  await Cart.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  console.log("Sample data destroyed successfully");
};

const runSeeder = async () => {
  try {
    await connectDB();

    if (process.argv[2] === "-d") {
      await destroyData();
    } else {
      await importData();
    }

    process.exitCode = 0;
  } catch (error) {
    console.error(`Seeder error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runSeeder();
