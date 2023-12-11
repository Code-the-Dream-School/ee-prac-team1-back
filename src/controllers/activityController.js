const Activity = require('../models/Activity');
const User = require('../models/User');
const { getCoordinatesFromZipCode } = require('../utils/geocoding');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { isToday, isAfter } = require('date-fns');
const { DateTime } = require('luxon');


const getAllActivities = async (req, res) => {
  try {
    let activities = await Activity.find();

    if (activities.length === 0) {
      res
        .status(StatusCodes.OK)
        .json({ message: 'Users did not create any activity!' });
      return;
    }

    activities.sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentDate = new Date();

    const activitiesToday = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth() &&
        activityDate.getDate() === currentDate.getDate()
      );
    });

    const upcomingActivities = activities.filter(
      (activity) => new Date(activity.date) > currentDate
    );

    activitiesToday.sort((a, b) => new Date(a.date) - new Date(b.date));
    upcomingActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    activities = [
      "activities Today:", ...activitiesToday,
      "upcoming Activities:", ...upcomingActivities
    ];

    const message =
      `Pickleball app have ${activitiesToday.length} ${activitiesToday.length === 1 ? 'activity' : 'activities'
      } today, ` +
      `and ${upcomingActivities.length} ${upcomingActivities.length === 1
        ? 'upcoming activity'
        : 'upcoming activities'
      }. `;

    res.status(StatusCodes.OK).json({
      message,
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error in getAllActivities:', error);
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
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({
          error:
            'You do not have authorization to delete an activity you did not create.',
        });
    }

    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const addUserToActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId }).select('-password');
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }
  const { firstName, lastName, profileImage } = user;

  const activityWithUser = await Activity.findOne({
    _id: activityId,

    players: {
      $elemMatch: { $elemMatch: { playerId: userId } },
    },
  });
  console.log(activityWithUser);
  if (activityWithUser) {
    throw new BadRequestError('There is a duplicate user in the activity');
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
  } else {
    res.status(StatusCodes.OK).json({ activity });
  }
};

const removeUserFromActivity = async (req, res) => {
  try {
    const { id: activityId } = req.params;
    const { userId } = req.user;

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      {
        $pull: { players: { playerId: userId } },
      },
      { new: true }
    );
    if (!activity) {
      throw new NotFoundError(`No activity with id ${activityId}`);
    } else {
      res.status(StatusCodes.OK).json({ activity });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getCreatedActivities = async (req, res) => {
  const userId = req.params.userId;
  try {
    const activities = await Activity.find({ createdBy: userId });

    if (activities.length === 0) {
      res.status(StatusCodes.OK).json({ message: 'You did not create any activity!' });
      return;
    }

    activities.sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentDate = new Date();

    const activitiesToday = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth() &&
        activityDate.getDate() === currentDate.getDate()
      );
    });
    const upcomingActivities = activities.filter(activity => new Date(activity.date) > currentDate);

    const message =
      `You have ${activitiesToday.length} ${activitiesToday.length === 1 ? 'created activity' : 'created activities'} today, ` +
      `and ${upcomingActivities.length} ${upcomingActivities.length === 1 ? 'upcoming activity' : 'upcoming activities'}. `;

    res.status(StatusCodes.OK).json({
      message,
      activitiesToday,
      upcomingActivities
    });
  } catch (error) {
    console.error('Error in getCreatedActivities:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};


const getJoinedActivities = async (req, res) => {
  const userId = req.params.userId;

  try {
    const joinedActivities = await Activity.find({
      players: {
        $elemMatch: {
          playerId: userId,
        },
      },
    });

    if (joinedActivities.length === 0) {
      res.status(StatusCodes.OK).json({ message: 'You have not joined any activities yet!' });
      return;
    }

    joinedActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentDate = new Date();

    const activitiesToday = joinedActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth() &&
        activityDate.getDate() === currentDate.getDate()
      );
    });
    const upcomingActivities = joinedActivities.filter(activity => new Date(activity.date) > currentDate);

    const message =
      `You have ${activitiesToday.length} ${activitiesToday.length === 1 ? 'joined activity' : 'joined activities'} today, ` +
      `and ${upcomingActivities.length} ${upcomingActivities.length === 1 ? 'upcoming activity' : 'upcoming activities'}. `;

    res.status(StatusCodes.OK).json({
      message,
      activitiesToday,
      upcomingActivities
    });
  } catch (error) {
    console.error('Error in getJoinedActivities:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};


const getAllOtherActivities = async (req, res) => {
  const userId = req.params.userId;

  try {
    const allOtherActivities = await Activity.find({
      $and: [
        { createdBy: { $ne: userId } },
        { 'players.playerId': { $ne: userId } },
      ],
    });
    if (allOtherActivities.length === 0) {
      res.status(StatusCodes.OK).json({ message: 'No activities found!' });
      return;
    };
    console.log('All Other activities:', allOtherActivities.length);

    allOtherActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    const currentDate = new Date();

    const activitiesToday = allOtherActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth() &&
        activityDate.getDate() === currentDate.getDate()
      );
    });

    const upcomingActivities = allOtherActivities.filter(activity => new Date(activity.date) > currentDate);

    const message =
      `Pickleball app have ${activitiesToday.length} ${activitiesToday.length === 1 ? 'activity' : 'activities'} today, ` +
      `and ${upcomingActivities.length} ${upcomingActivities.length === 1 ? 'upcoming activity' : 'upcoming activities'}. `;

    res.status(StatusCodes.OK).json({
      message,
      'activitiesToday': activitiesToday,
      'upcomingActivities': upcomingActivities,
    });

  } catch (error) {
    console.error('Error in getAllActivities:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

module.exports = {
  getAllActivities,
  deleteActivity,
  getActivity,
  createActivity,
  editActivity,
  getActivity,
  addUserToActivity,
  removeUserFromActivity,
  getCreatedActivities,
  getJoinedActivities,
  getAllOtherActivities
};
