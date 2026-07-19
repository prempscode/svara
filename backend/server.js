const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`App listening on port ${port}!`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
