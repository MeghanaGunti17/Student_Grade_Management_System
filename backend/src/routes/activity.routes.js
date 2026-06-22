const express = require("express");
const router = express.Router();

const ActivityLog = require("../models/ActivityLog");

router.get("/", async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;