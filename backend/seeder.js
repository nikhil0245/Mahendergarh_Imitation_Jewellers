import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Cart from "./models/Cart.js";
import sampleProducts from "./data/sampleProducts.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    await User.create({
      name: "Admin User",
      email: "admin@bangleshop.com",
      password: "123456",
      isAdmin: true
    });

    await Product.insertMany(sampleProducts);

    console.log("Sample data imported successfully");
    console.log("Admin login: admin@bangleshop.com / 123456");
    process.exit();
  } catch (error) {
    console.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Sample data destroyed successfully");
    process.exit();
  } catch (error) {
    console.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
