require('dotenv').config();
const axios = require('axios');



async function getCoordinatesFromZipCode(zipCode) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: zipCode,
                key: process.env.GOOGLE_API_KEY,
            },
        });
        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            console.log('Coordinates:', { lat: location.lat, lng: location.lng });
            return { lat: location.lat, lng: location.lng };
        } else {
            console.error('Error getting coordinates from zip code:');
            return null;
        }
    } catch (error) {
        console.error('Error getting coordinates from zip code:', error);
        throw error;
    }
};

module.exports = { getCoordinatesFromZipCode };