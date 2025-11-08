# Cloudinary Setup Guide

## Why Images Are Not Showing

If you see `Images: []` in the console, it means **Cloudinary is not configured**. The images are being uploaded from your browser, but they're failing to upload to Cloudinary, so they're not being saved to the database.

## Quick Setup

### Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (no credit card required)
3. Verify your email

### Step 2: Get Your Credentials

1. After logging in, you'll see your **Dashboard**
2. Look for these values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 3: Update Your .env File

Open `backend/.env` and add/update these lines:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Replace the placeholder values with your actual Cloudinary credentials!

### Step 4: Restart Your Backend Server

1. Stop your backend server (Ctrl+C)
2. Start it again: `npm run dev`
3. You should see: `✅ Cloudinary configured successfully`

### Step 5: Test Image Upload

1. Try creating a product with an image
2. Check the backend console - you should see:
   - `Uploading to Cloudinary: ...`
   - `Upload successful. URL: https://res.cloudinary.com/...`
3. Check the browser console - you should see:
   - `Product images after creation: ["https://res.cloudinary.com/..."]`

## Troubleshooting

### Still seeing empty images array?

1. **Check your .env file:**
   - Make sure there are no quotes around the values
   - Make sure there are no extra spaces
   - Example: `CLOUDINARY_CLOUD_NAME=mycloud` (not `CLOUDINARY_CLOUD_NAME="mycloud"`)

2. **Check backend console:**
   - Look for `⚠️ Cloudinary not configured` message
   - It will tell you which credentials are missing

3. **Verify credentials:**
   - Double-check you copied the correct values from Cloudinary dashboard
   - Make sure you're using the API Secret (not the API Key twice)

4. **Restart server:**
   - After updating .env, you MUST restart the backend server
   - The .env file is only read when the server starts

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- Perfect for development and small projects

## Alternative: Test Without Cloudinary

If you want to test the app without setting up Cloudinary:
- Products will be created successfully
- But images will be empty `[]`
- You can add images later after setting up Cloudinary

