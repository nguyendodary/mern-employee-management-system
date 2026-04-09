const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dateOfJoining: { type: Date, default: Date.now },
    salary: { type: Number, required: true, default: 0 },
    bankAccount: {
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      ifsc: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
