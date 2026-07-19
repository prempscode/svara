const bcrypt = require("bcrypt");
const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const { uploadFile, deleteFile } = require("../services/storage.service");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// register — sets cookie, returns user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
    );
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        profileImage: newUser.profileImage || null,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// login
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await userModel.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );
    res.cookie("token", token, cookieOptions);

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
    console.error("loginUser error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "User logged out successfully" });
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred in auth.controller",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel
      .findById(userId)
      .select("-password -role -__v -updatedAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User profile fetched successfully", user });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred in auth.controller",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) {
      const existingUser = await userModel.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      if (user.profileImageFileId) {
        try {
          await deleteFile(user.profileImageFileId);
        } catch (error) {
          console.error("Error deleting old profile image:", error.message);
        }
      }
      const imageResult = await uploadFile(imageFile);
      user.profileImage = imageResult.url;
      user.profileImageFileId = imageResult.fileId;
    }

    await user.save();

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

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    if (user.profileImageFileId) {
      try {
        await deleteFile(user.profileImageFileId);
      } catch (error) {
        console.error("Error deleting profile image:", error.message);
      }
    }

    await userModel.findByIdAndDelete(userId);
    res.clearCookie("token", cookieOptions);

    res.status(200).json({ message: "Account deleted successfully" });
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
