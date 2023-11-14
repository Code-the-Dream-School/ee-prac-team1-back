const Activity = require('../models/Activity');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find();
    res.status(StatusCodes.OK).json({ activities, count: activities.length });
  } catch (error) {
    throw new BadRequestError('Error with getAllActivites');
  }
};

const getActivity = async (req, res) => {
  const {
    //    user: { userId },
    params: { id: activityId },
  } = req;
  const activity = await Activity.findOne({
    _id: activityId,
    //   createdBy: userId,
  });
  if (!activity) {
    throw new NotFoundError(`No activity with id ${activityId}`);
  }
  res.status(StatusCodes.OK).json({ activity });
};

const createActivity = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;
    const activity = await Activity.create(req.body);
    res.status(StatusCodes.CREATED).json({ activity });
  } catch (error) {
    console.error(error);
    throw new BadRequestError('Error in createActivity');
  }
};

const editActivity = async (req, res) => {
  const {
    body: {
      sportType,
      description,
      date,
      time,
      placeNum,
      street,
      city,
      state,
      zipCode,
      indoorOutdoor,
      players,
      maxPlayers,
      minPlayers,
      weather,
      tempF,
      createdBy,
      contactName,
      contactNum,
      fees,
      notes,
    },
    user: { userId },
    params: { id: activityId },
  } = req;

  if (
    sportType === '' ||
    date === '' ||
    time === '' ||
    street === '' ||
    city === '' ||
    zipCode === '' ||
    state === ''
  ) {
    throw new BadRequestError('Fields cannot be empty');
  }
  const activity = await Activity.findByIdAndUpdate(
    {
      _id: activityId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );
  if (!activity) {
    throw new NotFoundError(`No activity with id ${activityId}`);
  }
  res.status(StatusCodes.OK).json({ activity });
};

const deleteActivity = async (req, res) => {
  const {
    user: { userId },
    params: { id: activityId },
  } = req;

  const activity = await Activity.findByIdAndRemove({
    _id: activityId,
    createdBy: userId,
  });
  if (!activity) {
    throw new NotFoundError(`No activity with id ${activityId}`);
  }
  res.status(StatusCodes.OK).json({ msg: 'Activity was deleted' });
};

const addUserToActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;

  const activity = await Activity.findByIdAndUpdate(
    activityId,
    {
      $push: { players: userId },
    },
    { new: true }
  );
  if (!activity) {
    throw new NotFoundError(`No activity with id ${activityId}`);
  } else {
    res.status(StatusCodes.OK).json({ activity });
  }
};

const removeUserFromActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;

  const activity = await Activity.findByIdAndUpdate(
    activityId,
    {
      $pull: { players: userId },
    },
    { new: true }
  );
  if (!activity) {
    throw new NotFoundError(`No activity with id ${activityId}`);
  } else {
    res.status(StatusCodes.OK).json({ activity });
  }
};

module.exports = {
  createActivity,
  deleteActivity,
  getAllActivities,
  editActivity,
  getActivity,
  addUserToActivity,
  removeUserFromActivity,
};
