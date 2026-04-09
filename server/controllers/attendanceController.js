const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const todayStr = () => new Date().toISOString().split('T')[0];

// @desc  Check-in
// @route POST /api/attendance/checkin
const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const date = todayStr();
    const existing = await Attendance.findOne({ employee: employee._id, date });
    if (existing?.checkIn) return res.status(400).json({ message: 'Already checked in today' });

    const record = existing
      ? Object.assign(existing, { checkIn: new Date(), status: 'present' })
      : new Attendance({ employee: employee._id, date, checkIn: new Date(), status: 'present' });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

// @desc  Check-out
// @route POST /api/attendance/checkout
const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const date = todayStr();
    const record = await Attendance.findOne({ employee: employee._id, date });
    if (!record?.checkIn) return res.status(400).json({ message: 'No check-in found for today' });
    if (record.checkOut) return res.status(400).json({ message: 'Already checked out today' });

    record.checkOut = new Date();
    const ms = record.checkOut - record.checkIn;
    record.hoursWorked = parseFloat((ms / 3600000).toFixed(2));
    if (record.hoursWorked < 4) record.status = 'half-day';

    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
};

// @desc  Get my attendance (employee)
// @route GET /api/attendance/me?month=&year=
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const { month, year } = req.query;
    const filter = { employee: employee._id };

    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = `${year}-${String(month).padStart(2, '0')}-31`;
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// @desc  Get today's status (employee)
// @route GET /api/attendance/today
const getTodayStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const record = await Attendance.findOne({ employee: employee._id, date: todayStr() });
    res.json(record || null);
  } catch (err) {
    next(err);
  }
};

// @desc  Get all attendance (admin) with filters
// @route GET /api/attendance?employeeId=&date=&month=&year=&page=&limit=
const getAllAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.employeeId) filter.employee = req.query.employeeId;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.month && req.query.year) {
      const m = String(req.query.month).padStart(2, '0');
      filter.date = { $gte: `${req.query.year}-${m}-01`, $lte: `${req.query.year}-${m}-31` };
    }

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    res.json({ records, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance };
