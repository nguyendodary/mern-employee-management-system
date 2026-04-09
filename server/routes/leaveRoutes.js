const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, reviewLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('employee'), applyLeave);
router.get('/me', protect, authorize('employee'), getMyLeaves);
router.get('/', protect, authorize('admin'), getAllLeaves);
router.put('/:id/review', protect, authorize('admin'), reviewLeave);

module.exports = router;
