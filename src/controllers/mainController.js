const Activity = require("../models/Activity");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllActivities = async (req, res) => {
  const activities = await Activity.find();
  res.status(StatusCodes.OK).json({ activities, count: activities.length });
};

// const mainController = {};

// mainController.get = (req, res) => {
//   return res.json({
//     data: "This is a full stack app!",
//   });
// };

module.exports = { getAllActivities };
