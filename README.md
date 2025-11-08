# E-Commerce Web Application with Admin Dashboard

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce platform with comprehensive product management, order processing, and admin dashboard.

## Features

### User Features
- **Product Browsing**: Browse products with filtering and search
- **Product Details**: View detailed product information with image gallery
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout**: Complete order placement with shipping address
- **Order Management**: View order history and track order status
- **Authentication**: Secure login and registration with JWT

### Admin Features
- **Dashboard**: View statistics (products, orders, revenue, pending orders)
- **Product Management**: Full CRUD operations for products
- **Image Upload**: Multiple image uploads per product using Cloudinary
- **Order Management**: View all orders and update order status
- **Protected Routes**: Admin-only access to management pages

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Cloudinary for image storage
- Express Validator for input validation

### Frontend
- React.js with Hooks
- React Router for navigation
- Context API for state management
- Axios for API calls
- React Toastify for notifications
- Responsive CSS design

## Project Structure

```
ecommerce/
├── backend/
│   ├── models/              # Database models (MVC - Model)
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── controllers/         # Business logic (MVC - Controller)
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── routes/              # API routes (MVC - Routes)
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── config/              # Configuration files
│   │   └── db.js
│   ├── utils/               # Utility functions
│   │   └── cloudinary.js
│   ├── uploads/             # Temporary file storage
│   ├── server.js            # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Cloudinary account (for image storage)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here_change_this
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Create the `uploads` directory:
```bash
mkdir uploads
```

5. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Creating an Admin User

To create an admin user, you can use MongoDB directly or create a script. Here's a Node.js script to create an admin:

```javascript
// createAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
  
  await admin.save();
  console.log('Admin user created successfully!');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
```

Run the script:
```bash
cd backend
node createAdmin.js
```

## Default Admin Credentials

**Email:** admin@example.com  
**Password:** admin123

⚠️ **Important:** Change these credentials after first login in a production environment!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/user/:userId` - Get user's orders (protected)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (admin only)

## Features Implemented

✅ User authentication (JWT-based)  
✅ Product CRUD operations  
✅ Image upload with Cloudinary  
✅ Shopping cart functionality  
✅ Order placement and management  
✅ Admin dashboard with statistics  
✅ Product filtering, search, and sorting  
✅ Responsive design  
✅ Form validation  
✅ Loading states  
✅ Success/Error notifications  
✅ Auto stock update after order placement  
✅ Protected routes (user and admin)  
✅ Order status tracking  
✅ **MVC Architecture** (Models, Controllers, Routes separation)

## Bonus Features

- ✅ Auto stock update after order placement
- ✅ Multiple image uploads per product
- ✅ Responsive design for mobile and desktop
- ✅ **Proper folder structure (MVC pattern for backend)** - Controllers folder implemented

## Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- `PORT` - Backend server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

## Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your `.env` file

## Notes

- The application uses localStorage to persist cart and authentication tokens
- Images are uploaded to Cloudinary and local files are automatically deleted
- Stock is automatically updated when an order is placed
- Payment is simulated (set to 'Completed' by default)
- Admin routes are protected and only accessible to users with admin role

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or use MongoDB Atlas
- Check your `MONGODB_URI` in the `.env` file

### Image Upload Issues
- Verify Cloudinary credentials in `.env`
- Ensure the `uploads` directory exists in the backend folder

### CORS Issues
- The backend has CORS enabled for all origins in development
- For production, configure CORS to allow only your frontend domain

## License

This project is open source and available under the MIT License.

