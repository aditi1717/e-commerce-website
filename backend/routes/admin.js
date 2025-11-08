const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { getDashboard } = require('../controllers/adminController');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', auth, admin, getDashboard);

module.exports = router;

