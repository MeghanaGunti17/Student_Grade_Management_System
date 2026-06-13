const User = require("../models/User");
const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { logger } = require("../utils/logger");

/* ── REGISTER ── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, department, semester, section, batch } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role: role || "student" });

    // If registering as student, auto-create Student profile
    if (user.role === "student" && rollNumber) {
      const existingRoll = await Student.findOne({ rollNumber });
      if (!existingRoll) {
        const studentProfile = await Student.create({
          user: user._id,
          rollNumber,
          department: department || "Computer Science",
          semester: semester || 1,
          section: section || "A",
          batch: batch || "2021-2025",
        });
        user.studentProfile = studentProfile._id;
        await user.save({ validateBeforeSave: false });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/* ── LOGIN ── */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is registered as '${user.role}', not '${role}'` });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated" });
    }

    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Log login activity
    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      action: `${user.role} logged in`,
      entity: "auth",
      ip: req.ip,
    }).catch(() => {}); // non-critical

    // Get studentProfile if student
    let studentProfile = null;
    if (user.role === "student") {
      studentProfile = await Student.findOne({ user: user._id }).select("rollNumber cgpa semester section department");
    }

    return res.json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── REFRESH TOKEN ── */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newToken = generateToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.json({ success: true, token: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Refresh token expired. Please login again." });
    }
    next(err);
  }
};

/* ── GET ME ── */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let studentProfile = null;
    if (user.role === "student") {
      studentProfile = await Student.findOne({ user: user._id });
    }
    res.json({ success: true, user: { ...user.toObject(), studentProfile } });
  } catch (err) {
    next(err);
  }
};

/* ── LOGOUT ── */
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};