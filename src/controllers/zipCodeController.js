const Activity = require('../models/Activity');
const { getCoordinatesFromZipCode, getHaversineDistance } = require('../utils/geocoding');
const { StatusCodes } = require('http-status-codes');

const getActivitiesByZipCode = async (req, res) => {
    const { zipCode } = req.params;
    let activities;

    try {
        if (zipCode) {
            const enteredCoordinates = await getCoordinatesFromZipCode(zipCode);
            console.log('Entered Zip Code Coordinates:', enteredCoordinates);
            if (!enteredCoordinates) {
                return res.status(StatusCodes.OK).json({
                    message: 'No activities found for the provided ZIP code.',
                });
            }
            const radius = 25 / 3959;

            console.log('Query for Entered Zip Code:', {
                'location.coordinates': {
                    $geoWithin: {
                        $centerSphere: [
                            [enteredCoordinates.lng, enteredCoordinates.lat],
                            radius,
                        ],
                    },
                },
            });

            activities = await Activity.find({
                'location.coordinates': {
                    $geoWithin: {
                        $centerSphere: [
                            [enteredCoordinates.lng, enteredCoordinates.lat],
                            radius,
                        ],
                    },
                },
            });
            activities.forEach(activity => {
                if (activity.location.coordinates && activity.location.coordinates.coordinates.length === 2) {
                    activity.location.distance = getHaversineDistance(
                        { lat: enteredCoordinates.lat, lon: enteredCoordinates.lng },
                        { lat: activity.location.coordinates.coordinates[1], lon: activity.location.coordinates.coordinates[0] }
                    ).toFixed(2);
                } else {
                    activity.location.distance = Infinity;
                }
            });

            activities = activities.sort((a, b) => {
                const dateComparison = new Date(a.date) - new Date(b.date);
                if (dateComparison === 0) {
                    return a.location.distance - b.location.distance;
                }

                return dateComparison;
            });

        } else {
            console.log('No zip code provided. Getting all activities.');
            activities = await Activity.find();
        }

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

        const sortedActivities = activitiesToday.concat(upcomingActivities);

        const message =
            `Pickleball app found ${activitiesToday.length} ${activitiesToday.length === 1 ? 'activity' : 'activities'} today, ` +
            `and ${upcomingActivities.length} ${upcomingActivities.length === 1 ? 'upcoming activity' : 'upcoming activities'} near Zip Code you entered.`;

        return res.status(StatusCodes.OK).json({
            message,
            activities: sortedActivities,
            count: sortedActivities.length,
        });
    } catch (error) {
        console.error('Error in getActivitiesByZipCode:', error);
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

module.exports = { getActivitiesByZipCode };
