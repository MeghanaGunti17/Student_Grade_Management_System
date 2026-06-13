const express = require("express");

const router = express.Router();

const {
  getAllResults,
  getStudentResultsByName,
  getMyResults,
  createResult,
  updateResult,
  deleteResult,
  togglePublish,
  getGradeDistribution,
} = require("../controllers/resultController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

/* =========================
   ALL RESULTS
========================= */

router.get(
  "/",
  protect,
  getAllResults
);

/* =========================
   MY RESULTS
========================= */

router.get(
  "/my-results",
  protect,
  authorize("student"),
  getMyResults
);

/* =========================
   STUDENT RESULTS
========================= */

router.get(
  "/student/:studentName",
  protect,
  getStudentResultsByName
);

/* =========================
   GRADE DISTRIBUTION
========================= */

router.get(
  "/grade-distribution",
  protect,
  authorize("admin", "faculty"),
  getGradeDistribution
);

/* =========================
   CREATE RESULT
========================= */

router.post(
  "/",
  protect,
  authorize("admin", "faculty"),
  createResult
);

/* =========================
   UPDATE RESULT
========================= */

router.put(
  "/:id",
  protect,
  authorize("admin", "faculty"),
  updateResult
);

/* =========================
   PUBLISH / UNPUBLISH RESULT
========================= */

router.patch(
  "/:id/publish",
  protect,
  authorize("admin", "faculty"),
  togglePublish
);

/* =========================
   DELETE RESULT
========================= */

router.delete(
  "/:id",
  protect,
  authorize("admin", "faculty"), // <-- FIXED
  deleteResult
);

module.exports = router;