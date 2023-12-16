const Activity = require('../models/Activity');
const User = require('../models/User');
const { getCoordinatesFromZipCode } = require('../utils/geocoding');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { id } = require('date-fns/locale');

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
      res
        .status(StatusCodes.OK)
        .json({ message: 'You did not create any activity!' });
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
        maxPlayers,
        minPlayers,
        experienceLevel,
        contactName,
        contactPhoneNum,
        contactEmail,
        fees,
        notes,
      },
      user: { userId },
    } = req;

    if (
      activityType === '' ||
      date === '' ||
      time === '' ||
      location === '' ||
      venue === '' ||
      maxPlayers === '' ||
      minPlayers === '' ||
      experienceLevel === '' ||
      contactName === '' ||
      contactPhoneNum === '' ||
      contactEmail === ''
    ) {
      throw new BadRequestError('Required fields cannot be empty');
    }

    req.body.createdBy = userId;

    const feesValue = fees !== undefined && fees !== null ? Number(fees) : 0;
    const notesValue = notes !== undefined ? notes : '';

    // Check if an activity with the same uniqueFields already exists
    const existingActivity = await Activity.findOne({
      'uniqueFields.activityType': activityType,
      'uniqueFields.date': date,
      'uniqueFields.location.address': location.address,
      'uniqueFields.location.city': location.city,
      'uniqueFields.location.state': location.state,
      'uniqueFields.location.zipCode': location.zipCode,
      'uniqueFields.contactName': contactName,
      'uniqueFields.contactEmail': contactEmail,
    });

    if (existingActivity) {
      const errorMessage = 'You have already created this activity.';
      return res.status(StatusCodes.CONFLICT).json({ error: errorMessage });
    }

    // If no existing activity, proceed to create a new one
    const activity = await Activity.create({
      activityType,
      date,
      time,
      location: {
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
      },
      venue,
      maxPlayers,
      minPlayers,
      experienceLevel,
      contactName,
      contactPhoneNum,
      contactEmail,
      fees: feesValue,
      notes: notesValue,
      createdBy: userId,
    });

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
        maxPlayers,
        minPlayers,
        experienceLevel,
        contactName,
        contactPhoneNum,
        contactEmail,
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
      maxPlayers === '' ||
      minPlayers === '' ||
      experienceLevel === '' ||
      contactName === '' ||
      contactPhoneNum === '' ||
      contactEmail === ''
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

    const activity = await Activity.findOneAndRemove({
      _id: activityId,
      createdBy: userId,
    });
    if (!activity) {
      throw new NotFoundError(
        `No activity with id ${activityId} created by the current user.`
      );
    }
    res.status(StatusCodes.OK).json({ msg: 'Activity was deleted' });
  } catch (error) {
    console.error('Error in deleteActivity:', error);
    if (error instanceof NotFoundError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error:
          'You do not have authorization to delete an activity you did not create.',
      });
    }

    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const addUserToActivity = async (req, res, next) => {
  try {
    const { id: activityId } = req.params;
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId }).select('-password');

    if (!user) {
      throw new NotFoundError(`No user with id ${userId}`);
    }

    const { firstName, lastName, profileImage } = user;

    const activityWithUser = await Activity.find({
      _id: activityId,
      players: { $elemMatch: { playerId: userId } },
    });

    if (activityWithUser?.length !== 0) {
      return res
        .status(StatusCodes.OK)
        .json({ msg: 'You already signed up for this activity' });
    }

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      {
        $push: {
          players: { playerId: userId, firstName, lastName, profileImage },
        },
      },
      { new: true }
    );

    if (!activity) {
      throw new NotFoundError(`No activity with id ${activityId}`);
    }

    const successMessage = `You successfully signed up for the activity: ${activity.activityType}, ${activity.location.address}, ${activity.location.city}, ${activity.location.state}, ${activity.location.zipCode}, ${activity.date}.`;

    res.status(StatusCodes.OK).json({
      message: successMessage,
      activity: activity,
    });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const removeUserFromActivity = async (req, res) => {
  try {
    const { id: activityId } = req.params;
    const { userId } = req.user;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      throw new NotFoundError(`No activity with id ${activityId}`);
    }

    const isUserInActivity = activity.players.some(player => player.playerId.toString() === userId.toString());

    if (!isUserInActivity) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'You are not on the list of players for this activity.'
      });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      activityId,
      {
        $pull: { players: { playerId: userId } },
      },
      { new: true }
    );
    console.log('updatedActivity:', updatedActivity);
    const successMessage = `You successfully removed yourself from the activity: ${activity.activityType}, ${activity.location.address}, ${activity.location.city}, ${activity.location.state}, ${activity.location.zipCode}, ${activity.date}.`;

    res.status(StatusCodes.OK).json({
      message: successMessage,
    });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
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
