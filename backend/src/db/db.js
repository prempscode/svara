const mongoose = require("mongoose");
const dns = require('dns');

dns.setServers(["1.1.1.1", "8.8.8.8"]);
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const conn = await mongoose.connect(uri);
    console.log("db-connected");
  } catch (e) {
    console.log("Error : ", e.message);
  }
};

module.exports = connectDB;