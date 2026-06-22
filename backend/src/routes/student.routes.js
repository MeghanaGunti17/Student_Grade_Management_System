const express = require("express");

const router = express.Router();

const {
  getAllStudents,
  getStudentById,
  getMyProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentPerformance,
  getTopPerformers,
} = require("../controllers/studentController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

/* MY PROFILE */
router.get(
  "/my-profile",
  protect,
  authorize("student"),
  getMyProfile
);

/* TOP PERFORMERS */
router.get(
  "/top-performers",
  protect,
  authorize("admin", "faculty"),
  getTopPerformers
);

/* ALL STUDENTS */
router.get(
  "/",
  protect,
  authorize("admin", "faculty"),
  getAllStudents
);

/* SINGLE STUDENT */
router.get(
  "/:id",
  protect,
  getStudentById
);

/* STUDENT PERFORMANCE */
router.get(
  "/:id/performance",
  protect,
  getStudentPerformance
);

/* CREATE STUDENT */
router.post(
  "/",
  protect,
  authorize("admin"),
  createStudent
);
router.post(
  "/",
  protect,
  authorize("admin", "faculty"),
  createStudent
);

/* UPDATE STUDENT */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateStudent
);
router.put(
  "/:id",
  protect,
  authorize("admin", "faculty"),
  updateStudent
);

/* DELETE STUDENT */
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteStudent
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "faculty"),
  deleteStudent
);

module.exports = router;