const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Generate unique order ID
const generateOrderId = () => {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { products, shippingAddress, paymentMethod } = req.body;

    // Validate products and calculate total
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Determine payment status based on payment method
    const paymentStatus = paymentMethod === 'Online Pay' ? 'Completed' : 'Pending';

    // Create order
    const order = new Order({
      orderId: generateOrderId(),
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus
    });

    await order.save();
    await order.populate('products.productId', 'name images');
    
    // Send order confirmation email (mock)
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        await sendOrderConfirmationEmail(order, user);
      }
    } catch (emailError) {
      console.error('Email sending error (non-blocking):', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/user/:userId
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    // Check if user is accessing their own orders or is admin
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find({ userId: req.params.userId })
      .populate({
        path: 'products.productId',
        select: 'name images _id',
        model: 'Product'
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = req.body.orderStatus;
    if(req.body.orderStatus==='Delivered'){
      order.paymentStatus='Completed';
    }
    await order.save();
    await order.populate('products.productId', 'name images');

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

