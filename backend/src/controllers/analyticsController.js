const analyticsService =
  require("../services/analyticsService");

/* =========================
   DASHBOARD STATS
========================= */

const getDashboardStats =
  async (req, res, next) => {
    try {
      const stats =
        await analyticsService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   TREND ANALYTICS
========================= */

const getTrendAnalytics =
  async (req, res, next) => {
    try {
      const data =
        await analyticsService.getTrendAnalytics();

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   DEPARTMENT ANALYTICS
========================= */

const getDepartmentAnalytics =
  async (req, res, next) => {
    try {
      const data =
        await analyticsService.getDepartmentAnalytics();

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================
   STUDENT INSIGHTS
========================= */

const getStudentInsights =
  async (req, res, next) => {
    try {
      const insights =
        await analyticsService.analyzeStudent(
          req.params.studentId
        );

      res.json({
        success: true,
        data: insights,
      });
    } catch (err) {
      next(err);
    }
  };

module.exports = {
  getDashboardStats,
  getStudentInsights,
  getTrendAnalytics,
  getDepartmentAnalytics,
};