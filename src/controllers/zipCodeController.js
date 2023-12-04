const Activity = require('../models/Activity');
const { getCoordinatesFromZipCode } = require('../utils/geocoding');
const { StatusCodes } = require('http-status-codes');

const getActivitiesByZipCode = async (req, res) => {
    const { zipCode } = req.params;
    console.log('Entered getActivitiesByZipCode');

    try {
        let activities;

        if (zipCode) {
            console.log('Zip code provided:', zipCode);

            const enteredCoordinates = await getCoordinatesFromZipCode(zipCode);
            console.log('Entered Zip Code Coordinates:', enteredCoordinates);

            const radius = 25 / 3963.2;

            if (enteredCoordinates !== null) {
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
                console.log('Entered Coordinates:', [enteredCoordinates.lng, enteredCoordinates.lat]);
                console.log('Radius:', radius);
            } else {
                console.error('Invalid or null coordinates.');
            }


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

            const activityCount = activities.length;

            if (activityCount === 0) {
                return res.status(StatusCodes.OK).json({
                    message: 'No activities found near the zip code you entered.',
                });
            }

            return res.status(StatusCodes.OK).json({
                message: `There ${activityCount === 1 ? 'is' : 'are'} ${activityCount} ${activityCount === 1 ? 'activity' : 'activities'} near you.`,
                activities,
                count: activityCount,
            });
        } else {
            console.log('No zip code provided. Getting all activities.');
            activities = await Activity.find();

            const activityCount = activities.length;

            if (activityCount === 0) {
                return res.status(StatusCodes.OK).json({
                    message: 'No activities found.',
                });
            }

            return res.status(StatusCodes.OK).json({
                message: `There ${activityCount === 1 ? 'is' : 'are'} ${activityCount} ${activityCount === 1 ? 'activity' : 'activities'}.`,
                activities,
                count: activityCount,
            });
        }
    } catch (error) {
        console.error('Error in getActivitiesByZipCode:', error);
        if (error instanceof TypeError && error.message.includes('Cannot read properties of null')) {
            // Handle the specific error related to null coordinates
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid or null coordinates. Please check the entered zip code.' });
        } else {
            // Handle other errors generically
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
};

module.exports = {
    getActivitiesByZipCode
};