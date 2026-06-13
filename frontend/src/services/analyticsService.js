// src/services/analyticsService.js

import API from "./api";

/* =========================
   DASHBOARD ANALYTICS
========================= */

export const getAnalytics = async () => {
  try {
    const response = await API.get("/analytics");

    return response.data;
  } catch (error) {
    console.error(
      "Analytics Fetch Error:",
      error
    );

    return {
      success: false,
      data: {
        totalStudents: 0,
        averageCGPA: 0,
        passRate: 0,
        atRiskCount: 0,
      },
    };
  }
};

/* =========================
   STUDENT INSIGHTS
========================= */

export const getStudentInsights =
  async (studentId) => {
    try {
      const response =
        await API.get(
          `/analytics/student/${studentId}`
        );

      return response.data;
    } catch (error) {
      console.error(
        "Student Insights Error:",
        error
      );

      return {
        success: false,
        data: {},
      };
    }
  };