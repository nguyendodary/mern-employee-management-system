require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Employee.deleteMany(),
    Attendance.deleteMany(),
    Leave.deleteMany(),
  ]);

  console.log('Cleared existing data...');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ems.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create employees
  const empUsers = await User.insertMany([
    { name: 'Alice Johnson', email: 'alice@ems.com', password: await bcrypt.hash('emp123', 10), role: 'employee' },
    { name: 'Bob Smith', email: 'bob@ems.com', password: await bcrypt.hash('emp123', 10), role: 'employee' },
    { name: 'Carol White', email: 'carol@ems.com', password: await bcrypt.hash('emp123', 10), role: 'employee' },
  ]);

  const departments = ['Engineering', 'Marketing', 'HR'];
  const designations = ['Software Engineer', 'Marketing Manager', 'HR Executive'];

  const employees = await Employee.insertMany(
    empUsers.map((u, i) => ({
      user: u._id,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      department: departments[i],
      designation: designations[i],
      phone: `98765432${i}0`,
      address: `${i + 1} Main Street, City`,
      salary: 60000 + i * 10000,
      dateOfJoining: new Date(`2023-0${i + 1}-15`),
    }))
  );

  // Seed attendance for last 7 days
  const today = new Date();
  for (const emp of employees) {
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      const checkIn = new Date(date.setHours(9, 0, 0));
      const checkOut = new Date(date.setHours(18, 0, 0));

      await Attendance.create({
        employee: emp._id,
        date: dateStr,
        checkIn,
        checkOut,
        status: 'present',
        hoursWorked: 9,
      }).catch(() => {}); // skip duplicates
    }
  }

  // Seed a pending leave
  await Leave.create({
    employee: employees[0]._id,
    leaveType: 'sick',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 2),
    totalDays: 3,
    reason: 'Not feeling well',
    status: 'pending',
  });

  console.log('✅ Seed complete!');
  console.log('Admin: admin@ems.com / admin123');
  console.log('Employee: alice@ems.com / emp123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
