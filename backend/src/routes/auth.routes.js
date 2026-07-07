const router = require("express").Router();
const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/auth.controller");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
// here the concept we are using for the logout is basic
// but in production we use token-blacklisting & we use 
// it so that the old token generated couldnt be used
// by any other to misuse it .  
router.post("/logout", authController.logoutUser);

module.exports = router;
