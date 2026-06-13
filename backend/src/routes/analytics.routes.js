const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getStudentInsights,
  getTrendAnalytics,
  getDepartmentAnalytics,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

/* =========================
   DASHBOARD ANALYTICS
========================= */

router.get(
  "/",
  protect,
  authorize("admin", "faculty"),
  getDashboardStats
);

/* =========================
   TREND ANALYTICS
========================= */

router.get(
  "/trends",
  protect,
  authorize("admin", "faculty"),
  getTrendAnalytics
);

/* =========================
   DEPARTMENT ANALYTICS
========================= */

router.get(
  "/departments",
  protect,
  authorize("admin", "faculty"),
  getDepartmentAnalytics
);

/* =========================
   STUDENT INSIGHTS
========================= */

router.get(
  "/student/:studentId",
  protect,
  authorize("admin", "faculty"),
  getStudentInsights
);

module.exports = router;