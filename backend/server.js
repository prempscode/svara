const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const connectDB = require("./src/db/db");



const port = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
  connectDB();
});
