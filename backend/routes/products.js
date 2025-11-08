const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// @route   GET /api/products
// @desc    Get all products with pagination, filtering, and sorting
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('sort').optional().isIn(['price-asc', 'price-desc', 'newest']).withMessage('Invalid sort option')
], getProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Add new product (admin only)
// @access  Private/Admin
router.post('/', auth, admin, upload.array('images', 5), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], createProduct);

// @route   PUT /api/products/:id
// @desc    Update product (admin only)
// @access  Private/Admin
router.put('/:id', auth, admin, upload.array('images', 5), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product (admin only)
// @access  Private/Admin
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;

