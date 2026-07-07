const router = require("express").Router();
const multer = require("multer");
const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
});

//  AUTH ROUTES

// register
router.post("/register", authController.registerUser);

// Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// Resend OTP
router.post("/resend-otp", authController.resendOTP);

// login
router.post("/login", authController.loginUser);

// logout
// here the concept we are using for the logout is basic
// but in production we use token-blacklisting & we use
// it so that the old token generated couldnt be used
// by any other to misuse it .
router.post("/logout", authController.logoutUser);

// USER PROFILE ROUTES

// get own profile
router.get("/profile", authMiddleware.authGlobal, authController.getProfile);

// get any user's public profile (for viewing other users)
router.get(
  "/profile/:userId",
  authMiddleware.authGlobal,
  authController.getUserProfile,
);

// update own profile (with optional profile image upload)
router.patch(
  "/profile",
  authMiddleware.authGlobal,
  upload.fields([{ name: "image", maxCount: 1 }]),
  authController.updateProfile,
);

// delete own account
router.delete(
  "/profile",
  authMiddleware.authGlobal,
  authController.deleteAccount,
);

module.exports = router;
