// backend/src/models/Class.js
// STATUS: 🆕 NEW FILE
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    academicYear: { type: String, required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    studentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Class || mongoose.model('Class', classSchema);