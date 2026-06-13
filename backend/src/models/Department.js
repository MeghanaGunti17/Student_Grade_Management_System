const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    // Department Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Department Code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // HOD
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Description
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

departmentSchema.index({
  code: 1,
});

departmentSchema.index({
  name: 1,
});

/* =========================
   EXPORT MODEL
========================= */

module.exports =
  mongoose.models.Department ||
  mongoose.model(
    "Department",
    departmentSchema
  );