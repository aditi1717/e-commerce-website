# Troubleshooting Guide

## Product Creation Error (500 Internal Server Error)

If you're getting a 500 error when creating products, here are the most common causes and solutions:

### 1. Cloudinary Not Configured

**Problem:** Cloudinary credentials are missing or incorrect in `.env` file.

**Solution:**
1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Get your credentials from the Cloudinary Dashboard
3. Update your `backend/.env` file with:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart your backend server

**Note:** You can create products without images if Cloudinary is not configured. The product will be saved but without image URLs.

### 2. Uploads Directory Missing

**Problem:** The `uploads/` directory doesn't exist.

**Solution:**
The application automatically creates the `uploads/` directory. If it still fails:
```bash
cd backend
mkdir uploads
```

### 3. File Size Too Large

**Problem:** Image file exceeds 5MB limit.

**Solution:**
- Compress your images before uploading
- Maximum file size is 5MB per image
- You can upload up to 5 images per product

### 4. Invalid File Type

**Problem:** File is not an image (not jpeg, jpg, png, gif, or webp).

**Solution:**
- Only image files are allowed
- Supported formats: JPEG, JPG, PNG, GIF, WEBP

### 5. MongoDB Connection Issue

**Problem:** Database is not connected.

**Solution:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env` file
- Check the console for MongoDB connection errors

### 6. Check Server Logs

Always check your backend server console for detailed error messages. The error will show:
- Exact error message
- Stack trace (in development mode)
- Which step failed (upload, database, etc.)

### Quick Test Without Images

To test if the issue is with Cloudinary:
1. Try creating a product without uploading any images
2. If it works, the issue is with Cloudinary configuration
3. If it still fails, check MongoDB connection and server logs

