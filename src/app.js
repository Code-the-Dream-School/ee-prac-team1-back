require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");
const session = require("express-session");

// importing auth middleware to protect our Activity routes
const authenticateUser = require("./middleware/authentication");
// ROUTERS
const authRouter = require("./routes/auth");
const myActivitiesRouter = require("./routes/myActivities");
const allActivitiesRouter = require("./routes/allActivities");

// ERROR HANDLER
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// ROUTES
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/activities", allActivitiesRouter);
app.use("/api/v1/myActivities", authenticateUser, myActivitiesRouter);

app.use("/api/v1/auth/users", authenticateUser, authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
