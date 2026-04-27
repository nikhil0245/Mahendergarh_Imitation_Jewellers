# Ecommerce Website

This is a beginner-friendly MERN stack ecommerce website for a bangle shop.

## Tech Stack

- Frontend: React.js with Vite
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- Image Upload: Multer

## Project Folder Structure

```text
New project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── productController.js
│   │   └── uploadController.js
│   ├── data/
│   │   └── sampleProducts.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── asyncHandler.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── productRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/
│   │   └── .gitkeep
│   ├── .env.example
│   ├── package.json
│   ├── seeder.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminProductFormPage.jsx
│   │   │   ├── AdminProductsPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Features Included

- Product listing page
- Product details page
- Add to cart
- User signup and login
- Admin panel to add, edit, and delete products
- Image upload support

## Backend API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`

### Upload

- `POST /api/upload`

## Step-by-Step Setup Instructions

### 1. Create MongoDB database

Use local MongoDB or MongoDB Atlas.

Example local URL:

```env
mongodb://127.0.0.1:27017/bangle-shop
```

### 2. Setup backend

Move into the backend folder:

```bash
cd backend
```

Install packages:

```bash
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bangle-shop
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

Start backend server:

```bash
npm run dev
```

Optional: add sample products and an admin user:

```bash
npm run seed
```

### 3. Setup frontend

Open a new terminal and move into frontend:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Create a `.env` file using `.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend server:

```bash
npm run dev
```

### 4. Open the website

Visit:

```text
http://localhost:5173
```

## Admin Login

If you run the seed command, use this admin account:

- Email: `admin@bangleshop.com`
- Password: `123456`

If you do not run the seed command, signup creates a normal user. In that case, you can still manually change `isAdmin` to `true` in MongoDB.

## Notes For Beginners

- Product images are stored in the `backend/uploads` folder.
- Uploaded image paths are saved in MongoDB.
- The seed command adds sample SVG product images, and you can replace them later by uploading real product photos from the admin panel.
- Cart data is stored in MongoDB for each logged-in user.
- Checkout/payment is not added yet, but the cart flow is ready for future extension.
