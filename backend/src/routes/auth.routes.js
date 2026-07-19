const router = require("express").Router();
const multer = require("multer");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });

// AUTH ROUTES

// register
router.post("/register", authController.registerUser);

// login
router.post("/login", authController.loginUser);

// logout
router.post("/logout", authController.logoutUser);

// USER PROFILE ROUTES

router.get("/profile", authMiddleware.authGlobal, authController.getProfile);

router.get(
  "/profile/:userId",
  authMiddleware.authGlobal,
  authController.getUserProfile,
);

router.patch(
  "/profile",
  authMiddleware.authGlobal,
  upload.fields([{ name: "image", maxCount: 1 }]),
  authController.updateProfile,
);

router.delete(
  "/profile",
  authMiddleware.authGlobal,
  authController.deleteAccount,
);

module.exports = router;
