const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    // Subject Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Subject Code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Department
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // Semester
    semester: {
      type: Number,
      min: 1,
      max: 12,
      required: true,
    },

    // Credits
    credits: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },

    // Subject Type
    type: {
      type: String,
      enum: [
        "theory",
        "practical",
        "project",
      ],
      default: "theory",
    },

    // Maximum Marks
    maxMarks: {
      type: Number,
      default: 100,
      min: 1,
    },

    // Passing Marks
    passingMarks: {
      type: Number,
      default: 40,
      min: 0,
    },

    // Assigned Faculty
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Subject Description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Active Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

subjectSchema.index({
  code: 1,
});

subjectSchema.index({
  semester: 1,
});

subjectSchema.index({
  department: 1,
});

subjectSchema.index({
  faculty: 1,
});

/* =========================
   EXPORT MODEL
========================= */

module.exports =
  mongoose.models.Subject ||
  mongoose.model(
    "Subject",
    subjectSchema
  );