const express = require("express");

const router = express.Router();

const {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceRecords,
  getMyAttendanceAnalytics,
  deleteAttendance,
} = require("../controllers/attendanceController");

const { protect } =
  require("../middleware/auth");

const { authorize } =
  require("../middleware/authorize");

/* =========================
   GET ALL ATTENDANCE
========================= */

router.get(
  "/",
  protect,
  getAttendanceRecords
);

/* =========================
   STUDENT ATTENDANCE ANALYTICS
========================= */

router.get(
  "/my-analytics",
  protect,
  authorize("student"),
  getMyAttendanceAnalytics
);

/* =========================
   MARK SINGLE ATTENDANCE
========================= */

router.post(
  "/",
  protect,
  authorize(
    "admin",
    "faculty"
  ),
  markAttendance
);

/* =========================
   BULK ATTENDANCE
========================= */

router.post(
  "/bulk",
  protect,
  authorize(
    "admin",
    "faculty"
  ),
  bulkMarkAttendance
);

/* =========================
   DELETE ATTENDANCE
========================= */

router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "faculty"
  ),
  deleteAttendance
);

module.exports = router;