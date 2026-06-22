  const Result = require("../models/Result");
  const Student = require("../models/Student");
  const ActivityLog = require("../models/ActivityLog");
  const User = require("../models/User");
  const Notification = require("../models/Notification");
  /* ── GET ALL RESULTS ── */
  exports.getAllResults = async (req, res, next) => {
    try {
      const {
        page = 1, limit = 50, search, semester, examType, isPublished, sortBy = "createdAt", sortOrder = "desc",
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter = {};
      if (search) filter.studentName = { $regex: search, $options: "i" };
      if (semester) filter.semester = Number(semester);
      if (examType) filter.examType = examType;
      if (isPublished !== undefined) filter.isPublished = isPublished === "true";

      const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      const [results, total] = await Promise.all([
        Result.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
        Result.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: results,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (err) {
      next(err);
    }
  };

  /* ── GET RESULTS BY STUDENT NAME ── */
  exports.getStudentResultsByName = async (req, res, next) => {
    try {
      const results = await Result.find({
        studentName: { $regex: req.params.studentName, $options: "i" },
      }).sort({ createdAt: -1 });

      res.json({ success: true, data: results, count: results.length });
    } catch (err) {
      next(err);
    }
  };

  /* ── GET MY RESULTS (student self) ── */
  exports.getMyResults = async (req, res, next) => {
    try {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.json({ success: true, data: [], message: "No student profile linked" });

      const results = await Result.find({
        $or: [{ student: student._id }, { studentName: req.user.name }],
      }).sort({ createdAt: -1 });

      res.json({ success: true, data: results, count: results.length });
    } catch (err) {
      next(err);
    }
  };

  /* ── CREATE RESULT ── */
  exports.createResult = async (req, res, next) => {
    try {
      const {
        studentName,
        subject,
        marks,
        marksObtained,
        subjectName,
        maxMarks,
        semester,
        examType,
        faculty,
        academicYear,
        remarks,
      } = req.body;

      const finalStudentName = (studentName || "").trim();
      const finalSubject = (subjectName || subject || "").trim();
      const finalMarks = Number(
        marksObtained || marks || 0
      );

      if (!finalStudentName || !finalSubject) {
        return res.status(400).json({
          success: false,
          message:
            "Student name and subject are required",
        });
      }

      if (
        isNaN(finalMarks) ||
        finalMarks < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid marks are required",
        });
      }

      /* =========================
        FIND STUDENT PROFILE
      ========================= */

      let studentRef = null;

      const users = await User.find({
        name: {
          $regex: finalStudentName,
          $options: "i",
        },
        role: "student",
      });

      if (users.length === 1) {
        const studentProfile =
          await Student.findOne({
            user: users[0]._id,
          });

        if (studentProfile) {
          studentRef = studentProfile._id;
        }
      }

      /* =========================
        CREATE RESULT
      ========================= */

      const result = await Result.create({
        studentName: finalStudentName,
        student: studentRef,
        subjectName: finalSubject,
        marksObtained: finalMarks,
        maxMarks: Number(maxMarks) || 100,
        semester: Number(semester) || 1,
        academicYear:
          academicYear || "2024-25",
        examType:
          examType || "internal",
        faculty:
          faculty ||
          req.user?.name ||
          "Faculty",
        remarks: remarks || "",
        isPublished: false,
      });

      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        action: `Added result for ${finalStudentName} - ${finalSubject}: ${finalMarks}`,
        entity: "result",
        entityId: result._id.toString(),
      }).catch(() => {});

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
  /* ── UPDATE RESULT ── */
  exports.updateResult = async (req, res, next) => {
    try {
      const { subject, marks, subjectName, marksObtained, maxMarks, semester, examType, faculty, remarks, isPublished } = req.body;

      const finalSubject = subjectName || subject;
      const finalMarks = Number(marksObtained || marks);

      const updates = {};
      if (finalSubject) updates.subjectName = finalSubject.trim();
      if (!isNaN(finalMarks)) updates.marksObtained = finalMarks;
      if (maxMarks) updates.maxMarks = Number(maxMarks);
      if (semester) updates.semester = Number(semester);
      if (examType) updates.examType = examType;
      if (faculty) updates.faculty = faculty.trim();
      if (remarks !== undefined) updates.remarks = remarks;
      if (isPublished !== undefined) updates.isPublished = Boolean(isPublished);

      const result = await Result.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
      if (!result) return res.status(404).json({ success: false, message: "Result not found" });

      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        action: `Updated result for ${result.studentName} — ${result.subjectName}`,
        entity: "result",
        entityId: result._id.toString(),
      }).catch(() => {});

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  /* ── DELETE RESULT ── */
  exports.deleteResult = async (req, res, next) => {
    try {
      const result = await Result.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ success: false, message: "Result not found" });

      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        action: `Deleted result for ${result.studentName} — ${result.subjectName}`,
        entity: "result",
        entityId: req.params.id,
      }).catch(() => {});

      res.json({ success: true, message: "Result deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  /* ── PUBLISH/UNPUBLISH RESULTS ── */
  /* ── PUBLISH/UNPUBLISH RESULTS ── */
exports.togglePublish = async (req, res, next) => {
  try {
    const result = await Result.findById(
      req.params.id
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    result.isPublished =
      !result.isPublished;

    await result.save();

   /* Notification */

if (
  result.isPublished &&
  result.student
) {
  const student =
    await Student.findById(
      result.student
    );

  if (student?.user) {
    await Notification.create({
      recipient:
        student.user,

      type:
        "result_published",

      priority:
        "medium",

      title:
        "Result Published",

      message:
        `${result.subjectName} result has been published`,
    }).catch(() => {});
  }
}
    res.json({
      success: true,
      message:
        result.isPublished
          ? "Result published"
          : "Result unpublished",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
/* ── GET GRADE DISTRIBUTION ── */
exports.getGradeDistribution =
  async (req, res, next) => {
    try {
      const results =
        await Result.find();

      const grades = {
        O: 0,
        "A+": 0,
        A: 0,
        "B+": 0,
        B: 0,
        C: 0,
        F: 0,
      };

      results.forEach(
        (result) => {
          const percentage =
            (result.marksObtained /
              result.maxMarks) *
            100;

          if (
            percentage >= 90
          )
            grades["O"]++;

          else if (
            percentage >= 80
          )
            grades["A+"]++;

          else if (
            percentage >= 70
          )
            grades["A"]++;

          else if (
            percentage >= 60
          )
            grades["B+"]++;

          else if (
            percentage >= 50
          )
            grades["B"]++;

          else if (
            percentage >= 40
          )
            grades["C"]++;

          else grades["F"]++;
        }
      );

      const distribution =
        Object.entries(
          grades
        ).map(
          ([grade, count]) => ({
            _id: grade,
            count,
          })
        );

      res.json({
        success: true,
        data: distribution,
      });
    } catch (err) {
      next(err);
    }
  };