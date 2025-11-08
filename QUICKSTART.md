# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- MongoDB running locally or MongoDB Atlas account
- Cloudinary account (free tier works)

## Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend:
```bash
npm run dev
```

## Step 2: Create Admin User

In a new terminal:
```bash
cd backend
node createAdmin.js
```

This creates:
- Email: `admin@example.com`
- Password: `admin123`

## Step 3: Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing

1. **As Admin:**
   - Login with `admin@example.com` / `admin123`
   - Go to Admin Dashboard
   - Add products with images
   - View and manage orders

2. **As User:**
   - Register a new account
   - Browse products
   - Add to cart
   - Place an order
   - View order history

## Troubleshooting

- **MongoDB not connecting**: Check if MongoDB is running or update MONGODB_URI
- **Image upload fails**: Verify Cloudinary credentials in `.env`
- **CORS errors**: Ensure backend is running on port 5000

