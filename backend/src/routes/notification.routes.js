const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  markRead,
  markAllRead,
  sendNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

/* =========================
   MY NOTIFICATIONS
========================= */

router.get(
  "/",
  protect,
  getMyNotifications
);

/* =========================
   MARK SINGLE NOTIFICATION READ
========================= */

router.patch(
  "/:id/read",
  protect,
  markRead
);

/* =========================
   MARK ALL READ
========================= */

router.patch(
  "/read-all",
  protect,
  markAllRead
);

/* =========================
   SEND NOTIFICATION
========================= */

router.post(
  "/",
  protect,
  authorize("admin", "faculty"),
  sendNotification
);

module.exports = router;