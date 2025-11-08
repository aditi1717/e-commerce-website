const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️  Cloudinary not configured. Image uploads will be disabled.');
  console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
  console.warn('   Current values:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
    api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
  });
}

const uploadToCloudinary = async (filePath) => {
  if (!isCloudinaryConfigured()) {
    const errorMsg = 'Cloudinary is not configured. Please set Cloudinary credentials in .env file';
    console.error('❌ Cloudinary not configured!');
    console.error('   Missing credentials in .env file');
    console.error('   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    throw new Error(errorMsg);
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    console.log('📤 Uploading to Cloudinary:', filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ecommerce/products',
      use_filename: true,
      unique_filename: true
    });
    
    console.log('✅ Upload successful. URL:', result.secure_url);
    
    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message || error);
    console.error('   Error code:', error.http_code || 'N/A');
    console.error('   Full error:', error);
    // Clean up file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

const uploadMultipleToCloudinary = async (filePaths) => {
  try {
    const uploadPromises = filePaths.map(filePath => uploadToCloudinary(filePath));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw error;
  }
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary };

