const bcrypt = require("bcrypt");
const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role="user" } = req.body;

    // Check if the user already exists
    const existingUser = await userModel.findOne({
        $or:[
            {username},
            {email},
        ]
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET);
    
    res.cookie("token", token);
    res.status(201).json({ message: "User registered successfully", newUser });
    
  }
  catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username ,email, password } = req.body;

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
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({ message: "Login successful" , user});
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const logoutUser = async(req,res) =>{
  res.clearCookie("token");
  res.status(200).json({
    message:"User logged out successfully"
  });
}

module.exports = {registerUser, loginUser, logoutUser};