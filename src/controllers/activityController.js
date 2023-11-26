const Activity = require('../models/Activity');
const { getCoordinatesFromZipCode } = require('../utils/geocoding');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find();
    if (activities.length === 0) {
      res
        .status(StatusCodes.OK)
        .json({ message: 'Users did not create any activity!' });
    } else {
      res.status(StatusCodes.OK).json({ activities, count: activities.length });
    }
  } catch (error) {
    console.error('Error in getAllActivities:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ createdBy: req.user.userId });
    if (activities.length === 0) {
      res.status(StatusCodes.OK).json({ message: 'You did not create any activity!' });
    } else {
      res.status(StatusCodes.OK).json({ activities, count: activities.length });
    }
  } catch (error) {
    console.error('Error in getMyActivities:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getActivity = async (req, res) => {
  try {
    const {
      params: { id: activityId },
    } = req;
    const activity = await Activity.findOne({
      _id: activityId,
    });
    if (!activity) {
      throw new NotFoundError(`No activity with id ${activityId}`);
    }
    res.status(StatusCodes.OK).json({ activity });
  } catch (error) {
    console.error('Error in getActivity:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const {
      body: {
        activityType,
        date,
        time,
        location,
        venue,
        players,
        maxPlayers,
        minPlayers,
        contactName,
        contactNum,
        contactEmail,
        fees,
        notes,
      },
      user: { userId },
      params: { id: activityId },
    } = req;

    if (
      activityType === '' ||
      date === '' ||
      time === '' ||
      location === '' ||
      venue === '' ||
      players === '' ||
      maxPlayers === '' ||
      minPlayers === '' ||
      contactName === '' ||
      contactNum === '' ||
      contactEmail === '' ||
      fees === '' ||
      notes === ''
    ) {
      throw new BadRequestError('Fields cannot be empty');
    }
    req.body.createdBy = req.user.userId;
    const activity = await Activity.create(req.body);
    res.status(StatusCodes.CREATED).json({ activity });
  } catch (error) {
    console.error('Error in createActivity:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const editActivity = async (req, res) => {
  try {
    const {
      body: {
        activityType,
        date,
        time,
        location,
        venue,
        players,
        maxPlayers,
        minPlayers,
        contactName,
        contactNum,
        contactEmail,
        fees,
        notes,
      },
      user: { userId },
      params: { id: activityId },
    } = req;

    if (
      activityType === '' ||
      date === '' ||
      time === '' ||
      location === '' ||
      venue === '' ||
      players === '' ||
      maxPlayers === '' ||
      minPlayers === '' ||
      contactName === '' ||
      contactNum === '' ||
      contactEmail === '' ||
      fees === '' ||
      notes === ''
    ) {
      throw new BadRequestError('Fields cannot be empty');
    }

    if (location) {
      const coordinates = await getCoordinatesFromZipCode(
        `${location.address}, ${location.townOrCity}, ${location.state}, ${location.zipCode}`
      );

      location.coordinates = {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat],
      };
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
  } catch (error) {
    console.error('Error in editActivity:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error in deleteActivity:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
const addUserToActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const { userId } = req.user;

  const activityWithUser = await Activity.find({ players: { $eq: userId } });
  console.log(activityWithUser);
  if (activityWithUser?.length !== 0) {
    throw new BadRequestError('There is a duplicate user in the activity');
  }

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
  const { userId } = req.user;

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
  getAllActivities,
  createActivity,
  deleteActivity,
  getMyActivities,
  editActivity,
  getActivity,
  addUserToActivity,
  removeUserFromActivity,
};
