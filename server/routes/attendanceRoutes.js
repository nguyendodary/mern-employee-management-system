const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/checkin', protect, authorize('employee'), checkIn);
router.post('/checkout', protect, authorize('employee'), checkOut);
router.get('/me', protect, authorize('employee'), getMyAttendance);
router.get('/today', protect, authorize('employee'), getTodayStatus);
router.get('/', protect, authorize('admin'), getAllAttendance);

module.exports = router;
