const express = require('express');
const router = express.Router();
const { adminStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/admin', protect, authorize('admin'), adminStats);

module.exports = router;
