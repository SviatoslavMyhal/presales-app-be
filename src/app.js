require("express-async-errors");
const express = require("express");
const cors = require("cors");
const presalesRoutes = require("./routes/presalesRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/presales", presalesRoutes);
app.use(errorHandler);

module.exports = app;
