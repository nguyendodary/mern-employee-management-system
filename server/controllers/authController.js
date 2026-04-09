const User = require('../models/User');
const Employee = require('../models/Employee');
const generateToken = require('../utils/generateToken');

// @desc  Register user (admin only in production; open for seeding)
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

// @desc  Login
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }

    const token = generateToken(user._id, user.role);

    // Attach employee profile if exists
    let employeeProfile = null;
    if (user.role === 'employee') {
      employeeProfile = await Employee.findOne({ user: user._id });
    }

    res.json({ user, token, employeeProfile });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let employeeProfile = null;
    if (user.role === 'employee') {
      employeeProfile = await Employee.findOne({ user: user._id });
    }
    res.json({ user, employeeProfile });
  } catch (err) {
    next(err);
  }
};

// @desc  Update profile (name, avatar, password)
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, avatar, password } = req.body;

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
