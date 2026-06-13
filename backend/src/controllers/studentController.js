const User = require("../models/User");
const Student = require("../models/Student");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");
const ActivityLog = require("../models/ActivityLog");

/* ── GET ALL STUDENTS ── */
exports.getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, semester, section, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let userFilter = { role: "student", isActive: true };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(userFilter).select("_id name email avatar");
    const userIds = users.map((u) => u._id);

    const studentFilter = { user: { $in: userIds } };
    if (semester) studentFilter.semester = Number(semester);
    if (section) studentFilter.section = section.toUpperCase();

    const sortObj = { [sortBy === "cgpa" ? "cgpa" : "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    const [students, total] = await Promise.all([
      Student.find(studentFilter)
        .populate("user", "name email avatar")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Student.countDocuments(studentFilter),
    ]);

    const data = students.map((s) => ({
      _id: s._id,
      name: s.user?.name,
      email: s.user?.email,
      avatar: s.user?.avatar,
      rollNumber: s.rollNumber,
      enrollmentNumber: s.enrollmentNumber,
      department: s.department,
      semester: s.semester,
      section: s.section,
      batch: s.batch,
      cgpa: s.cgpa,
      attendancePercentage: s.attendancePercentage,
      riskScore: s.riskScore,
      weakSubjects: s.weakSubjects,
      performanceTier: s.performanceTier,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));

    res.json({
      success: true,
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET STUDENT BY ID ── */
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email avatar phone lastLogin");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Fetch recent results
    const results = await Result.find({ student: student._id }).sort({ createdAt: -1 }).limit(20);
    // Compute overall CGPA from results
    const published = results.filter((r) => r.gradePoints > 0);
    const cgpa = published.length
      ? Number((published.reduce((s, r) => s + r.gradePoints, 0) / published.length).toFixed(2))
      : student.cgpa;

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        results,
        computedCGPA: cgpa,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET MY PROFILE (student self) ── */
exports.getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate("user", "name email avatar phone lastLogin");
    if (!student) return res.json({ success: true, data: null, message: "No student profile linked" });

    const results = await Result.find({ student: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { ...student.toObject(), results } });
  } catch (err) {
    next(err);
  }
};

/* ── CREATE STUDENT ── */
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, department, semester, section, batch, enrollmentNumber } = req.body;

    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({ success: false, message: "Name, email, password and rollNumber are required" });
    }

    const existingUser =
await User.findOne({
  email:
    email.toLowerCase().trim(),
});
    if (existingUser) return res.status(409).json({ success: false, message: "Email already registered" });

    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) return res.status(409).json({ success: false, message: "Roll number already exists" });

    const user = await User.create({
  name,
  email:
    email.toLowerCase().trim(),
  password,
  role: "student",
});
    const studentProfile = await Student.create({
      user: user._id,
      rollNumber,
      enrollmentNumber,
      department: department || "Computer Science",
      semester: semester || 1,
      section: section || "A",
      batch: batch || "2021-2025",
    });

    user.studentProfile = studentProfile._id;
    await user.save({ validateBeforeSave: false });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `Added new student: ${name} (${rollNumber})`,
      entity: "student",
      entityId: studentProfile._id.toString(),
    }).catch(() => {});

    res.status(201).json({ success: true, data: { ...studentProfile.toObject(), user: { name, email } } });
  } catch (err) {
    next(err);
  }
};

/* ── UPDATE STUDENT ── */
exports.updateStudent = async (req, res, next) => {
  try {
    const { name, email, phone, avatar, rollNumber, department, semester, section, batch, cgpa, attendancePercentage } = req.body;

    const student = await Student.findById(req.params.id).populate("user");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Update User fields
    if (name || email || phone || avatar) {
      await User.findByIdAndUpdate(student.user._id, {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
      });
    }

    // Update Student fields
    const updates = {};
    if (rollNumber !== undefined) updates.rollNumber = rollNumber;
    if (department !== undefined) updates.department = department;
    if (semester !== undefined) updates.semester = semester;
    if (section !== undefined) updates.section = section;
    if (batch !== undefined) updates.batch = batch;
    if (cgpa !== undefined) updates.cgpa = cgpa;
    if (attendancePercentage !== undefined) updates.attendancePercentage = attendancePercentage;

    const updated = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate("user", "name email avatar phone");

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `Updated student: ${student.user.name}`,
      entity: "student",
      entityId: req.params.id,
    }).catch(() => {});

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE STUDENT ── */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Soft delete
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    await User.findByIdAndUpdate(student.user._id, { isActive: false });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: `Deactivated student: ${student.user.name}`,
      entity: "student",
      entityId: req.params.id,
    }).catch(() => {});

    res.json({ success: true, message: "Student deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

/* ── GET STUDENT PERFORMANCE SUMMARY ── */
exports.getStudentPerformance = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId).populate("user", "name email");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const results = await Result.find({ student: studentId });
    const attendance = await Attendance.find({ student: studentId });

    const totalClasses = attendance.length;
    const present = attendance.filter((a) => a.status === "present").length;
    const attendancePct = totalClasses > 0 ? Number(((present / totalClasses) * 100).toFixed(1)) : 0;

    const published = results.filter((r) => r.gradePoints > 0);
    const cgpa = published.length
      ? Number((published.reduce((s, r) => s + r.gradePoints, 0) / published.length).toFixed(2))
      : 0;

    const subjectPerf = results.reduce((acc, r) => {
      if (!acc[r.subjectName]) acc[r.subjectName] = { total: 0, count: 0, marks: [] };
      acc[r.subjectName].total += r.marksObtained;
      acc[r.subjectName].count += 1;
      acc[r.subjectName].marks.push(r.marksObtained);
      return acc;
    }, {});

    const subjectBreakdown = Object.entries(subjectPerf).map(([subject, data]) => ({
      subject,
      average: Number((data.total / data.count).toFixed(1)),
      attempts: data.count,
    }));

    const weakSubjects = subjectBreakdown.filter((s) => s.average < 50).map((s) => s.subject);

    // Update student record
    await Student.findByIdAndUpdate(studentId, { cgpa, attendancePercentage: attendancePct, weakSubjects });

    const riskScore = Math.round(
      (attendancePct < 75 ? 40 : 0) +
      (cgpa < 5 ? 40 : cgpa < 7 ? 20 : 0) +
      (weakSubjects.length > 2 ? 20 : weakSubjects.length * 5)
    );
    await Student.findByIdAndUpdate(studentId, { riskScore: Math.min(riskScore, 100) });

    res.json({
      success: true,
      data: {
        student: { name: student.user.name, email: student.user.email, rollNumber: student.rollNumber },
        cgpa,
        attendancePercentage: attendancePct,
        totalResults: results.length,
        subjectBreakdown,
        weakSubjects,
        riskScore: Math.min(riskScore, 100),
        gradeDistribution: results.reduce((acc, r) => {
          acc[r.grade] = (acc[r.grade] || 0) + 1;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET TOP PERFORMERS ── */
exports.getTopPerformers = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const students = await Student.find({ isActive: true })
      .populate("user", "name email avatar")
      .sort({ cgpa: -1 })
      .limit(limit);

    const data = students.map((s, i) => ({
      rank: i + 1,
      name: s.user?.name,
      email: s.user?.email,
      rollNumber: s.rollNumber,
      cgpa: s.cgpa,
      semester: s.semester,
      department: s.department,
      performanceTier: s.performanceTier,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};