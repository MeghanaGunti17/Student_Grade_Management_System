const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // Student Name
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Student Reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: false,
    },

    // Subject Reference
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // Subject Name Cache
    subjectName: {
      type: String,
      trim: true,
      default: "",
    },

    // Faculty Reference
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Faculty Name Cache
    facultyName: {
      type: String,
      default: "",
    },

    // Attendance Date
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Attendance Status
    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "late",
        "leave",
      ],
      default: "present",
    },

    // Semester
    semester: {
      type: Number,
      default: 1,
      min: 1,
      max: 12,
    },

    // Academic Year
    academicYear: {
      type: String,
      default: "2025-26",
    },

    // Department
    department: {
      type: String,
      default: "",
    },

    // Section
    section: {
      type: String,
      default: "A",
    },

    // Class Name
    className: {
      type: String,
      default: "",
    },

    // Attendance Percentage Snapshot
    attendancePercentage: {
      type: Number,
      default: 0,
    },

    // Remarks
    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // Marked By
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Active Record
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ======================
   INDEXES
====================== */

// Student Search
attendanceSchema.index({
  studentName: 1,
  date: -1,
});

// Prevent Duplicate Attendance
attendanceSchema.index(
  {
    student: 1,
    subject: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

// Date Reports
attendanceSchema.index({
  date: -1,
});

// Subject Reports
attendanceSchema.index({
  subject: 1,
});

// Semester Reports
attendanceSchema.index({
  semester: 1,
});

// Department Reports
attendanceSchema.index({
  department: 1,
});

// Status Reports
attendanceSchema.index({
  status: 1,
});

module.exports =
  mongoose.models.Attendance ||
  mongoose.model(
    "Attendance",
    attendanceSchema
  );