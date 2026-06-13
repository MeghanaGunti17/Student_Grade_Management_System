const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

/* =========================
   DASHBOARD STATS
========================= */

const getDashboardStats = async () => {
  const totalStudents =
    await Student.countDocuments();

  const totalFaculty =
    await User.countDocuments({
      role: "faculty",
    });

  const avgCGPAResult =
    await Student.aggregate([
      {
        $group: {
          _id: null,
          avgCGPA: {
            $avg: {
              $ifNull: ["$cgpa", 0],
            },
          },
        },
      },
    ]);

  const averageCGPA =
    avgCGPAResult.length > 0
      ? Number(
          avgCGPAResult[0].avgCGPA.toFixed(
            2
          )
        )
      : 0;

  const passedStudents =
    await Student.countDocuments({
      cgpa: {
        $gte: 5,
      },
    });

  const passRate =
    totalStudents > 0
      ? Number(
          (
            (passedStudents /
              totalStudents) *
            100
          ).toFixed(2)
        )
      : 0;

  const atRiskStudents =
    await Student.countDocuments({
      cgpa: {
        $lt: 5,
      },
    });

  return {
    totalStudents,
    totalFaculty,
    averageCGPA,
    passRate,
    atRiskStudents,
  };
};

/* =========================
   STUDENT INSIGHTS
========================= */

const analyzeStudent =
  async (studentId) => {
    const student =
      await Student.findById(
        studentId
      );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    return {
      studentName:
        student.name ||
        student.studentName ||
        student.rollNumber,

      cgpa:
        student.cgpa || 0,

      attendance:
        student.attendancePercentage ||
        0,

      riskScore:
        student.riskScore ||
        0,

      performanceTier:
        student.performanceTier ||
        "N/A",
    };
  };

/* =========================
   ATTENDANCE %
========================= */

const updateAttendancePercentage =
  async (studentId) => {
    const totalClasses =
      await Attendance.countDocuments({
        student: studentId,
      });

    const attendedClasses =
      await Attendance.countDocuments({
        student: studentId,
        status: "present",
      });

    const percentage =
      totalClasses > 0
        ? Number(
            (
              (attendedClasses /
                totalClasses) *
              100
            ).toFixed(2)
          )
        : 0;

    await Student.findByIdAndUpdate(
      studentId,
      {
        attendancePercentage:
          percentage,
      }
    );

    return percentage;
  };

/* =========================
   ATTENDANCE ANALYTICS
========================= */

const getAttendanceAnalytics =
  async (studentId) => {
    const records =
      await Attendance.find({
        student: studentId,
      });

    const total =
      records.length;

    const present =
      records.filter(
        (r) =>
          r.status?.toLowerCase() ===
          "present"
      ).length;

    const absent =
      records.filter(
        (r) =>
          r.status?.toLowerCase() ===
          "absent"
      ).length;

    const late =
      records.filter(
        (r) =>
          r.status?.toLowerCase() ===
          "late"
      ).length;

    const percentage =
      total > 0
        ? Number(
            (
              (present /
                total) *
              100
            ).toFixed(2)
          )
        : 0;

    return {
      totalClasses: total,
      presentClasses:
        present,
      absentClasses:
        absent,
      lateClasses: late,
      attendancePercentage:
        percentage,
      subjectWise: [],
      alerts: [],
    };
  };

  /* =========================
   TREND ANALYTICS
========================= */

const getTrendAnalytics =
  async () => {
    return [
      {
        month: "Jan",
        cgpa: 6.8,
        attendance: 78,
      },
      {
        month: "Feb",
        cgpa: 7.0,
        attendance: 80,
      },
      {
        month: "Mar",
        cgpa: 7.2,
        attendance: 82,
      },
      {
        month: "Apr",
        cgpa: 7.4,
        attendance: 84,
      },
      {
        month: "May",
        cgpa: 7.6,
        attendance: 86,
      },
      {
        month: "Jun",
        cgpa: 7.8,
        attendance: 88,
      },
    ];
  };

/* =========================
   DEPARTMENT ANALYTICS
========================= */

const getDepartmentAnalytics =
  async () => {
    return [
      {
        dept: "CSE",
        students: 120,
        cgpa: 7.8,
      },
      {
        dept: "ECE",
        students: 95,
        cgpa: 7.4,
      },
      {
        dept: "EEE",
        students: 80,
        cgpa: 7.1,
      },
      {
        dept: "MECH",
        students: 70,
        cgpa: 6.9,
      },
      {
        dept: "CIVIL",
        students: 60,
        cgpa: 6.8,
      },
    ];
  };
module.exports = {
  getDashboardStats,
  analyzeStudent,
  updateAttendancePercentage,
  getAttendanceAnalytics,
  getTrendAnalytics,
  getDepartmentAnalytics,
};