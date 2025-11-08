const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { uploadMultipleToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Get all products with pagination, filtering, and sorting
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    if (req.query.sort === 'price-asc') {
      sort = { price: 1 };
    } else if (req.query.sort === 'price-desc') {
      sort = { price: -1 };
    } else if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new product (admin only)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, stock } = req.body;

    console.log('Creating product:', { name, category, price, stock });
    console.log('Files received:', req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, file.originalname, file.size, 'bytes', 'Path:', file.path);
      });
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'image(s)...');
      try {
        const filePaths = req.files.map(file => file.path);
        console.log('Uploading files to Cloudinary:', filePaths);
        imageUrls = await uploadMultipleToCloudinary(filePaths);
        console.log('Images uploaded successfully. URLs:', imageUrls);
        console.log('Number of image URLs:', imageUrls.length);
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError.message || uploadError);
        console.error('Error details:', uploadError);
        // Clean up uploaded files if Cloudinary fails
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          }
        });
        
        // If Cloudinary is not configured, allow product creation without images
        const errorMessage = uploadError.message || uploadError.toString() || '';
        if (errorMessage.includes('not configured') || errorMessage.includes('Cloudinary')) {
          console.warn('⚠️ Creating product without images (Cloudinary not configured)');
          console.warn('   Please configure Cloudinary in .env file to enable image uploads');
          imageUrls = []; // Continue without images
        } else {
          console.error('❌ Failed to upload images:', errorMessage);
          return res.status(500).json({ 
            message: 'Failed to upload images. Please check Cloudinary configuration.',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          });
        }
      }
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: stock ? parseInt(stock) : 0,
      images: imageUrls
    });

    await product.save();

    // Populate and return the saved product
    const savedProduct = await Product.findById(product._id);
    console.log('Product created successfully:', savedProduct.name, 'Images:', savedProduct.images);
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, stock } = req.body;

    console.log('Updating product:', req.params.id);
    console.log('Update data:', { name, category, price, stock });
    console.log('Files received:', req.files ? req.files.length : 0);

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);

    // Handle new images
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'new image(s)...');
      try {
        const filePaths = req.files.map(file => file.path);
        console.log('Uploading files to Cloudinary:', filePaths);
        const newImageUrls = await uploadMultipleToCloudinary(filePaths);
        console.log('New images uploaded successfully. URLs:', newImageUrls);
        product.images = [...(product.images || []), ...newImageUrls];
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError.message || uploadError);
        console.error('Error details:', uploadError);
        // Clean up uploaded files if Cloudinary fails
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          }
        });
        
        // If Cloudinary is not configured, continue without adding new images
        const errorMessage = uploadError.message || uploadError.toString() || '';
        if (errorMessage.includes('not configured') || errorMessage.includes('Cloudinary')) {
          console.warn('⚠️ Updating product without new images (Cloudinary not configured)');
          console.warn('   Please configure Cloudinary in .env file to enable image uploads');
          // Continue with update, just don't add new images
        } else {
          console.error('❌ Failed to upload images:', errorMessage);
          return res.status(500).json({ 
            message: 'Failed to upload images. Please check Cloudinary configuration.',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          });
        }
      }
    }

    await product.save();
    
    // Fetch updated product
    const updatedProduct = await Product.findById(req.params.id);
    console.log('Product updated successfully:', updatedProduct.name, 'Images:', updatedProduct.images);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

