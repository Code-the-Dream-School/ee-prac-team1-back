const geocoder = require('node-geocoder');

const options = {
    provider: 'google',
    apiKey: process.env.GOOGLE_API_KEY,
};
const geocode = geocoder(options);

const getCoordinatesFromLocation = async (location) => {
    try {
        const result = await geocode.geocode(location);
        console.log('Geocoding result:', result);

        if (!result || result.length === 0 || result[0].latitude === undefined || result[0].longitude === undefined) {
            throw new Error('Location not found or recognized. Please make sure you entered an existing address.');
        }
        if (result[0].latitude === undefined || result[0].longitude === undefined) {
            throw new Error('Invalid geocoding response format');
        }

        const coordinates = {
            lat: result[0].latitude,
            lng: result[0].longitude,
        };

        return coordinates;
    } catch (error) {
        console.error('Error in getCoordinatesFromLocation:', error);
        throw error;
    }
};

module.exports = getCoordinatesFromLocation;