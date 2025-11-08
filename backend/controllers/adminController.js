const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.paymentStatus === 'Completed' ? order.totalAmount : 0);
    }, 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders
      },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

