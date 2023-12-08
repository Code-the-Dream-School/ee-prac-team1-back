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
        console.log('Geocoding API Response:', response.data);

        const location = response.data.results[0].geometry.location;
        console.log('Coordinates:', { lat: location.lat, lng: location.lng });

        return { lat: location.lat, lng: location.lng };
    } catch (error) {
        console.error('Error getting coordinates from zip code:', error);
        throw error;
    }
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getHaversineDistance(coord1, coord2) {
    const earthRadiusMiles = 3958.8;

    const lat1 = toRadians(coord1.lat);
    const lon1 = toRadians(coord1.lon);
    const lat2 = toRadians(coord2.lat);
    const lon2 = toRadians(coord2.lon);

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusMiles * c;
    return distance;
}

module.exports = { getCoordinatesFromZipCode, getHaversineDistance };