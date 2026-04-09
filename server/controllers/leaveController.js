const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const sendMail = require('../utils/mailer');

const calcDays = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / 86400000) + 1;
};

// @desc  Apply for leave (employee)
// @route POST /api/leaves
const applyLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const { leaveType, startDate, endDate, reason } = req.body;
    const totalDays = calcDays(startDate, endDate);

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    // Mock email notification
    await sendMail(
      employee.user.email,
      'Leave Application Submitted',
      `<p>Hi ${employee.user.name}, your ${leaveType} leave request for ${totalDays} day(s) has been submitted and is pending approval.</p>`
    );

    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
};

// @desc  Get my leaves (employee)
// @route GET /api/leaves/me
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    next(err);
  }
};

// @desc  Get all leaves (admin)
// @route GET /api/leaves?status=pending&page=1&limit=10
const getAllLeaves = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.employeeId) filter.employee = req.query.employeeId;

    const total = await Leave.countDocuments(filter);
    const leaves = await Leave.find(filter)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('reviewedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ leaves, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (err) {
    next(err);
  }
};

// @desc  Review leave (admin) - approve or reject
// @route PUT /api/leaves/:id/review
const reviewLeave = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const leave = await Leave.findById(req.params.id)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } });

    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Leave already reviewed' });

    leave.status = status;
    leave.adminComment = adminComment || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // Mark attendance as on-leave if approved
    if (status === 'approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date: dateStr },
          { employee: leave.employee._id, date: dateStr, status: 'on-leave' },
          { upsert: true, new: true }
        );
      }
    }

    // Notify employee
    await sendMail(
      leave.employee.user.email,
      `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `<p>Hi ${leave.employee.user.name}, your leave request has been <strong>${status}</strong>. ${adminComment ? `Admin note: ${adminComment}` : ''}</p>`
    );

    res.json(leave);
  } catch (err) {
    next(err);
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave };
