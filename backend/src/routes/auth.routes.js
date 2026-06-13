const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refreshToken,
  getMe,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

/* =========================
   PUBLIC ROUTES
========================= */

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.post(
  "/refresh-token",
  refreshToken
);

/* =========================
   PROTECTED ROUTES
========================= */

router.get(
  "/me",
  protect,
  getMe
);

router.post(
  "/logout",
  protect,
  logout
);

module.exports = router;