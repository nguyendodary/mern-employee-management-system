const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

// @desc  Admin dashboard stats
// @route GET /api/dashboard/admin
const adminStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalEmployees, presentToday, pendingLeaves, totalPayroll] = await Promise.all([
      Employee.countDocuments(),
      Attendance.countDocuments({ date: today, status: { $in: ['present', 'half-day'] } }),
      Leave.countDocuments({ status: 'pending' }),
      Payroll.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$netSalary' } } },
      ]),
    ]);

    // Recent leaves
    const recentLeaves = await Leave.find({ status: 'pending' })
      .populate({ path: 'employee', populate: { path: 'user', select: 'name' } })
      .limit(5)
      .sort({ createdAt: -1 });

    // Attendance trend last 7 days
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = await Attendance.countDocuments({ date: dateStr, status: { $in: ['present', 'half-day'] } });
      trend.push({ date: dateStr, present: count });
    }

    res.json({
      totalEmployees,
      presentToday,
      pendingLeaves,
      totalPayrollPaid: totalPayroll[0]?.total || 0,
      recentLeaves,
      attendanceTrend: trend,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { adminStats };
