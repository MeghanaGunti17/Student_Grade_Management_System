const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "faculty", "student", "parent"],
      default: "student",
      lowercase: true,
    },
    isEmailVerified: {
  type: Boolean,
  default: false,
},
passwordChangedAt: {
  type: Date,
  default: null,
},gender: {
  type: String,
  enum: ["male", "female", "other"],
  default: null,
},

address: {
  type: String,
  default: "",
},
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date, default: null },
    // For student users: link to their Student profile
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  },
  { timestamps: true }
);

/* Hash password before save */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_ROUNDS) || 10);
  next();
});

/* Compare password */
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ role: 1 });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);