const bcrypt = require("bcrypt");
const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const { uploadFile, deleteFile } = require("../services/storage.service");
const { generateOTP, sendOTPEmail } = require("../services/email.service");

// registration
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    // Check if user exists
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (unverified)
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "User registered! Please verify your email with OTP.",
      userId: newUser._id,
      // Don't send token yet - user needs to verify first
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    // Check OTP match
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token after verification
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );
    res.cookie("token", token);

    res.status(200).json({
      message: "Email verified successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "New OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// login - check if verified
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await userModel.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first. Check your inbox for OTP.",
        userId: user._id,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );
    res.cookie("token", token);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// logout
const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "User logged out successfully",
  });
};

// USER PROFILE FUNCTIONS

// get own profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred in auth.controller",
      error: error.message,
    });
  }
};

// get any user's public profile (for viewing other users)
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel
      .findById(userId)
      .select("-password -role -__v -updatedAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred in auth.controller",
      error: error.message,
    });
  }
};

// update user profile (with profile image upload)
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update username if provided
    if (username) {
      // check if username is already taken (by another user)
      const existingUser = await userModel.findOne({
        username: username,
        _id: { $ne: userId }, // exclude current user
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    // Update profile image if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      // If user already has a profile image, delete old one from ImageKit
      if (user.profileImageFileId) {
        try {
          await deleteFile(user.profileImageFileId);
        } catch (error) {
          console.error("Error deleting old profile image:", error.message);
        }
      }
      // Upload new profile image
      const imageResult = await uploadFile(imageFile);
      user.profileImage = imageResult.url;
      user.profileImageFileId = imageResult.fileId;
    }

    await user.save();

    // Return user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred in auth.controller",
      error: error.message,
    });
  }
};

// delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password before deleting account
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user's profile image from ImageKit if exists
    if (user.profileImageFileId) {
      try {
        await deleteFile(user.profileImageFileId);
      } catch (error) {
        console.error("Error deleting profile image:", error.message);
      }
    }

    // Optional: Delete all music uploaded by this user
    // const musicModel = require("../model/music.model");
    // await musicModel.deleteMany({ artist: userId });

    // Optional: Delete all albums created by this user
    // const albumModel = require("../model/album.model");
    // await albumModel.deleteMany({ artist: userId });

    await userModel.findByIdAndDelete(userId);

    // Clear the cookie
    res.clearCookie("token");

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred in auth.controller",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  resendOTP,
  verifyOTP,
  getProfile,
  getUserProfile,
  updateProfile,
  deleteAccount,
};
