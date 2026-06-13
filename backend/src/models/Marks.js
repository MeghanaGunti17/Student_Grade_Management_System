const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({

  studentName: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  marks: {
    type: Number,
    required: true,
  },

  faculty: {
    type: String,
    required: true,
  },

});

module.exports = mongoose.model(
  "Marks",
  marksSchema
);