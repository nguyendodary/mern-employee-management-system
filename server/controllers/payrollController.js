const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// @desc  Generate payroll for an employee (admin)
// @route POST /api/payroll/generate
const generatePayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Check if already generated
    const existing = await Payroll.findOne({ employee: employeeId, month, year });
    if (existing) return res.status(400).json({ message: 'Payroll already generated for this period' });

    // Count attendance for the month
    const monthStr = String(month).padStart(2, '0');
    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: `${year}-${monthStr}-01`, $lte: `${year}-${monthStr}-31` },
    });

    const presentDays = records.filter((r) => r.status === 'present' || r.status === 'half-day').length;
    const leaveDays = records.filter((r) => r.status === 'on-leave').length;
    const workingDays = new Date(year, month, 0).getDate(); // days in month

    // Simple payroll calculation
    const basicSalary = employee.salary;
    const perDayRate = basicSalary / workingDays;
    const earnedBasic = perDayRate * (presentDays + leaveDays);

    const allowances = {
      hra: parseFloat((earnedBasic * 0.4).toFixed(2)),
      transport: 1500,
      medical: 1250,
      other: 0,
    };

    const grossSalary = parseFloat(
      (earnedBasic + allowances.hra + allowances.transport + allowances.medical).toFixed(2)
    );

    const deductions = {
      pf: parseFloat((earnedBasic * 0.12).toFixed(2)),
      tax: parseFloat((grossSalary * 0.1).toFixed(2)),
      other: 0,
    };

    const netSalary = parseFloat(
      (grossSalary - deductions.pf - deductions.tax).toFixed(2)
    );

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary: parseFloat(earnedBasic.toFixed(2)),
      allowances,
      deductions,
      grossSalary,
      netSalary,
      workingDays,
      presentDays,
      leaveDays,
      generatedBy: req.user._id,
    });

    res.status(201).json(payroll);
  } catch (err) {
    next(err);
  }
};

// @desc  Mark payroll as paid (admin)
// @route PUT /api/payroll/:id/pay
const markPaid = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    payroll.status = 'paid';
    payroll.paidAt = new Date();
    await payroll.save();
    res.json(payroll);
  } catch (err) {
    next(err);
  }
};

// @desc  Get all payrolls (admin)
// @route GET /api/payroll?month=&year=&page=&limit=
const getAllPayrolls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.month) filter.month = parseInt(req.query.month);
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.employeeId) filter.employee = req.query.employeeId;

    const total = await Payroll.countDocuments(filter);
    const payrolls = await Payroll.find(filter)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .skip(skip)
      .limit(limit)
      .sort({ year: -1, month: -1 });

    res.json({ payrolls, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (err) {
    next(err);
  }
};

// @desc  Get my payslips (employee)
// @route GET /api/payroll/me
const getMyPayslips = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const payslips = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });
    res.json(payslips);
  } catch (err) {
    next(err);
  }
};

// @desc  Get single payslip
// @route GET /api/payroll/:id
const getPayslip = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('generatedBy', 'name');

    if (!payroll) return res.status(404).json({ message: 'Payslip not found' });
    res.json(payroll);
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePayroll, markPaid, getAllPayrolls, getMyPayslips, getPayslip };
