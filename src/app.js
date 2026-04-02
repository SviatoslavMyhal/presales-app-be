require("express-async-errors");
const express = require("express");
const cors = require("cors");
const optionalAuth = require("./middleware/optionalAuth");
const presalesRoutes = require("./routes/presalesRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const authRoutes = require("./routes/authRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(optionalAuth);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/presales", presalesRoutes);
app.use("/api/proposal", proposalRoutes);
app.use(errorHandler);

module.exports = app;
