const express = require('express');
const router = express.Router();
const {
  getEmployees, getEmployee, createEmployee,
  updateEmployee, deleteEmployee, getMyProfile, updateMyProfile,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/me/profile', protect, authorize('employee'), getMyProfile);
router.put('/me/profile', protect, authorize('employee'), updateMyProfile);

router.route('/')
  .get(protect, authorize('admin'), getEmployees)
  .post(protect, authorize('admin'), createEmployee);

router.route('/:id')
  .get(protect, authorize('admin'), getEmployee)
  .put(protect, authorize('admin'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;
