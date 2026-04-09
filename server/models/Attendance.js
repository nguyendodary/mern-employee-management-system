const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'on-leave'],
      default: 'absent',
    },
    hoursWorked: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
