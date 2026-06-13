const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
{
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
unique: true,
},

parent: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

rollNumber: {
  type: String,
  required: [true, "Roll number is required"],
  unique: true,
  trim: true,
},

enrollmentNumber: {
  type: String,
  unique: true,
  sparse: true,
  trim: true,
},

department: {
  type: String,
  default: "Computer Science",
  trim: true,
},

semester: {
  type: Number,
  min: 1,
  max: 12,
  default: 1,
},

section: {
  type: String,
  default: "A",
  uppercase: true,
  trim: true,
},

batch: {
  type: String,
  default: "2021-2025",
},

cgpa: {
  type: Number,
  min: 0,
  max: 10,
  default: 0,
},

attendancePercentage: {
  type: Number,
  min: 0,
  max: 100,
  default: 0,
},

riskScore: {
  type: Number,
  min: 0,
  max: 100,
  default: 0,
},

weakSubjects: [
  {
    type: String,
  },
],

isActive: {
  type: Boolean,
  default: true,
},

academicStatus: {
  type: String,
  enum: [
    "active",
    "detained",
    "graduated",
    "dropped",
  ],
  default: "active",
},

avatar: {
  type: String,
  default: "",
},

},
{
timestamps: true,
toJSON: {
virtuals: true,
},
toObject: {
virtuals: true,
},
}
);

/* =========================
PERFORMANCE TIER
========================= */

studentSchema.virtual(
"performanceTier"
).get(function () {
if (this.cgpa >= 9)
return "Excellent";

if (this.cgpa >= 8)
return "Good";

if (this.cgpa >= 6)
return "Average";

if (this.cgpa >= 4)
return "Below Average";

return "At Risk";
});

/* =========================
INDEXES
========================= */

studentSchema.index({
semester: 1,
section: 1,
});

studentSchema.index({
cgpa: -1,
});

studentSchema.index({
riskScore: -1,
});

module.exports =
mongoose.models.Student ||
mongoose.model(
"Student",
studentSchema
);
