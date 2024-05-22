const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chat");

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
