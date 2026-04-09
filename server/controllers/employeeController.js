const User = require('../models/User');
const Employee = require('../models/Employee');

// Helper to build pagination meta
const paginate = (total, page, limit) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
  limit,
});

// @desc  Get all employees (admin)
// @route GET /api/employees?page=1&limit=10&department=&search=
const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.department) filter.department = req.query.department;

    // Search by name/email via user lookup
    let userIds;
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      const users = await User.find({ $or: [{ name: regex }, { email: regex }] }).select('_id');
      userIds = users.map((u) => u._id);
      filter.user = { $in: userIds };
    }

    const total = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .populate('user', 'name email avatar isActive')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ employees, pagination: paginate(total, page, limit) });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single employee
// @route GET /api/employees/:id
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email avatar role');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// @desc  Create employee + user account (admin)
// @route POST /api/employees
const createEmployee = async (req, res, next) => {
  try {
    const {
      name, email, password, department, designation,
      phone, address, dateOfJoining, salary,
      bankAccount, emergencyContact,
    } = req.body;

    // Create user account
    const user = await User.create({ name, email, password, role: 'employee' });

    // Generate employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      user: user._id,
      employeeId,
      department,
      designation,
      phone,
      address,
      dateOfJoining,
      salary,
      bankAccount,
      emergencyContact,
    });

    const populated = await employee.populate('user', 'name email avatar');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// @desc  Update employee (admin)
// @route PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const fields = ['department', 'designation', 'phone', 'address', 'salary', 'bankAccount', 'emergencyContact', 'dateOfJoining'];
    fields.forEach((f) => { if (req.body[f] !== undefined) employee[f] = req.body[f]; });

    // Update user name/email if provided
    if (req.body.name || req.body.email) {
      await User.findByIdAndUpdate(employee.user, {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.email && { email: req.body.email }),
      });
    }

    await employee.save();
    const populated = await employee.populate('user', 'name email avatar');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// @desc  Delete employee (admin)
// @route DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Deactivate user instead of hard delete
    await User.findByIdAndUpdate(employee.user, { isActive: false });
    await employee.deleteOne();

    res.json({ message: 'Employee removed' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get own employee profile
// @route GET /api/employees/me/profile
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id }).populate('user', 'name email avatar');
    if (!employee) return res.status(404).json({ message: 'Profile not found' });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// @desc  Update own employee profile
// @route PUT /api/employees/me/profile
const updateMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Profile not found' });

    const allowed = ['phone', 'address', 'emergencyContact', 'bankAccount'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) employee[f] = req.body[f]; });

    await employee.save();
    const populated = await employee.populate('user', 'name email avatar');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getMyProfile, updateMyProfile };
