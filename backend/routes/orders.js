const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, [
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Pincode is required')
], createOrder);

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', auth, admin, getAllOrders);

// @route   GET /api/orders/user/:userId
// @desc    Get user's orders
// @access  Private
router.get('/user/:userId', auth, getUserOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', auth, admin, [
  body('orderStatus').isIn(['Pending', 'Processing', 'Shipped', 'Delivered']).withMessage('Invalid order status')
], updateOrderStatus);

module.exports = router;

