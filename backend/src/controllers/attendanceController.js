const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

/* =========================
   MARK SINGLE ATTENDANCE
========================= */

const markAttendance = async (
  req,
  res,
  next
) => {
  try {
    const {
      studentId,
      studentName,
      subjectId,
      date,
      status,
      remarks,
    } = req.body;

    const attendance =
      await Attendance.findOneAndUpdate(
        {
          student: studentId,
          subject: subjectId,
          date: new Date(date),
        },
        {
          student: studentId,
          studentName,
          subject: subjectId,
          status,
          remarks:
            remarks || "",
          markedBy:
            req.user?._id ||
            null,
        },
        {
          upsert: true,
          new: true,
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Attendance marked successfully",
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   BULK ATTENDANCE
========================= */

const bulkMarkAttendance =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { records } =
        req.body;

      let success = 0;
      let failed = 0;

      for (const record of records) {
        try {
          await Attendance.findOneAndUpdate(
            {
              student:
                record.studentId,
              subject:
                record.subjectId,
              date: new Date(
                record.date
              ),
            },
            {
              student:
                record.studentId,
              studentName:
                record.studentName,
              subject:
                record.subjectId,
              status:
                record.status,
              remarks:
                record.remarks ||
                "",
              markedBy:
                req.user?._id ||
                null,
            },
            {
              upsert: true,
              new: true,
            }
          );

          success++;
        } catch (error) {
          failed++;
        }
      }

      res.json({
        success: true,
        data: {
          success,
          failed,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   GET ALL ATTENDANCE
========================= */

const getAttendanceRecords =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        studentId,
        subjectId,
        startDate,
        endDate,
      } = req.query;

      const filter = {};

      if (studentId) {
        filter.student =
          studentId;
      }

      if (subjectId) {
        filter.subject =
          subjectId;
      }

      if (
        startDate ||
        endDate
      ) {
        filter.date = {};

        if (startDate) {
          filter.date.$gte =
            new Date(
              startDate
            );
        }

        if (endDate) {
          filter.date.$lte =
            new Date(
              endDate
            );
        }
      }

      const records =
        await Attendance.find(
          filter
        )
          .populate(
            "student",
            "rollNumber"
          )
          .populate(
            "subject",
            "subjectName"
          )
          .sort({
            date: -1,
          });

      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   STUDENT ATTENDANCE ANALYTICS
========================= */

const getMyAttendanceAnalytics =
  async (
    req,
    res,
    next
  ) => {
    try {
      const student =
        await Student.findOne(
          {
            user:
              req.user._id,
          }
        );

      if (!student) {
        return res.json({
          success: true,
          data: {
            totalAttendance: 0,
            present: 0,
            absent: 0,
            percentage: 0,
          },
        });
      }

      const totalAttendance =
        await Attendance.countDocuments(
          {
            student:
              student._id,
          }
        );

      const present =
        await Attendance.countDocuments(
          {
            student:
              student._id,
            status:
              "present",
          }
        );

      const absent =
        await Attendance.countDocuments(
          {
            student:
              student._id,
            status:
              "absent",
          }
        );

      const percentage =
        totalAttendance > 0
          ? Number(
              (
                (present /
                  totalAttendance) *
                100
              ).toFixed(2)
            )
          : 0;

      res.json({
        success: true,
        data: {
          totalAttendance,
          present,
          absent,
          percentage,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   DELETE ATTENDANCE
========================= */

const deleteAttendance =
  async (
    req,
    res,
    next
  ) => {
    try {
      const attendance =
        await Attendance.findByIdAndDelete(
          req.params.id
        );

      if (
        !attendance
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Attendance not found",
          });
      }

      res.json({
        success: true,
        message:
          "Attendance deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  };

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceRecords,
  getMyAttendanceAnalytics,
  deleteAttendance,
};