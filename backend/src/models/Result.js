const mongoose = require("mongoose");

const gradeFromPercentage = (pct) => {
  if (pct >= 90) return { grade: "O",  gradePoints: 10 };
  if (pct >= 80) return { grade: "A+", gradePoints: 9  };
  if (pct >= 70) return { grade: "A",  gradePoints: 8  };
  if (pct >= 60) return { grade: "B+", gradePoints: 7  };
  if (pct >= 55) return { grade: "B",  gradePoints: 6  };
  if (pct >= 50) return { grade: "C",  gradePoints: 5  };
  if (pct >= 40) return { grade: "D",  gradePoints: 4  };
  return           { grade: "F",  gradePoints: 0  };
};

const resultSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    // Optional ref for linked students
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    subjectCode: {
  type: String,
  default: "",
  trim: true,
},
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: [0, "Marks cannot be negative"],
    },
    maxMarks: { type: Number, default: 100 },
    semester: { type: Number, default: 1, min: 1, max: 12 },
    academicYear: { type: String, default: "2024-25" },
    examType: {
      type: String,
      enum: ["internal", "external", "midterm", "final", "quiz", "assignment"],
      default: "internal",
    },
    faculty: { type: String, default: "Faculty", trim: true },
    remarks: { type: String, default: "", trim: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: {
  type: Date,
  default: null,
},
    grade: { type: String, default: "" },
    gradePoints: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Auto-compute grade + gradePoints before save */
resultSchema.pre("save", function (next) {
  const pct = (this.marksObtained / this.maxMarks) * 100;
  const { grade, gradePoints } = gradeFromPercentage(pct);
  this.grade = grade;
  this.gradePoints = gradePoints;
  next();
});

/* Also compute before findOneAndUpdate */
resultSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.marksObtained !== undefined || update.maxMarks !== undefined) {
    const marks = update.marksObtained ?? 0;
    const max = update.maxMarks ?? 100;
    const pct = (marks / max) * 100;
    const { grade, gradePoints } = gradeFromPercentage(pct);
    this.getUpdate().grade = grade;
    this.getUpdate().gradePoints = gradePoints;
  }
  next();
});

/* Virtual: percentage */
resultSchema.virtual("percentage").get(function () {
  return Number(((this.marksObtained / this.maxMarks) * 100).toFixed(2));
});

/* Indexes */
resultSchema.index({ studentName: 1 });
resultSchema.index({ student: 1 });
resultSchema.index({ semester: 1 });
resultSchema.index({ isPublished: 1 });
resultSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Result || mongoose.model("Result", resultSchema, "marks");