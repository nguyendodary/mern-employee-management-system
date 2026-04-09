const cron = require('node-cron');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const sendMail = require('../utils/mailer');

/**
 * Daily attendance reminder — runs at 9:00 AM every weekday
 * Sends email to employees who haven't checked in yet
 */
const attendanceReminder = cron.schedule('0 9 * * 1-5', async () => {
  console.log('[CRON] Running daily attendance reminder...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const employees = await Employee.find().populate('user', 'name email isActive');

    for (const emp of employees) {
      if (!emp.user?.isActive) continue;

      const record = await Attendance.findOne({ employee: emp._id, date: today });
      if (!record || !record.checkIn) {
        await sendMail(
          emp.user.email,
          'Attendance Reminder',
          `<p>Hi ${emp.user.name}, you haven't checked in yet today. Please mark your attendance.</p>`
        );
      }
    }
    console.log('[CRON] Attendance reminder sent.');
  } catch (err) {
    console.error('[CRON] Attendance reminder error:', err.message);
  }
}, { scheduled: false }); // set to true in production

/**
 * Monthly payroll reminder — runs on 25th of every month at 10:00 AM
 */
const payrollReminder = cron.schedule('0 10 25 * *', async () => {
  console.log('[CRON] Monthly payroll reminder triggered.');
  // Notify admin to generate payroll
}, { scheduled: false });

const startJobs = () => {
  attendanceReminder.start();
  payrollReminder.start();
  console.log('[CRON] Background jobs started.');
};

module.exports = { startJobs };
