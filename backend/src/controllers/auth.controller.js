const bcrypt = require("bcrypt");
const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const { uploadFile, deleteFile } = require("../services/storage.service");

// register
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    // check if the user already exists
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profileImage: null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// login
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
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
  getProfile,
  getUserProfile,
  updateProfile,
  deleteAccount,
};
