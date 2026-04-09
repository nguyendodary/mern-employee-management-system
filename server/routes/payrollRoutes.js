const express = require('express');
const router = express.Router();
const { generatePayroll, markPaid, getAllPayrolls, getMyPayslips, getPayslip } = require('../controllers/payrollController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/generate', protect, authorize('admin'), generatePayroll);
router.get('/me', protect, authorize('employee'), getMyPayslips);
router.get('/', protect, authorize('admin'), getAllPayrolls);
router.put('/:id/pay', protect, authorize('admin'), markPaid);
router.get('/:id', protect, getPayslip);

module.exports = router;
