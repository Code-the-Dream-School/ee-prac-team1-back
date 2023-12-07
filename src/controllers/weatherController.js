const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors/not-found');
const axios = require('axios');
const { validateLocationWithUSPS } = require('../utils/zipCodeVerification'); // Adjust the path accordingly
require('dotenv').config();

function roundTimeToNearestHour(time) {
    const [hours, minutes] = time.split(':');
    const roundedHours =
        parseInt(hours, 10) + (parseInt(minutes, 10) >= 30 ? 1 : 0);
    const roundedValue = parseInt(
        roundedHours.toString().padStart(2, '0') + '00',
        10,
    );

    // Remove leading zero if present
    const result = roundedValue.toString().replace(/^0/, '');

    return parseInt(result, 10);
}

async function axiosData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather URL:', error);
        throw error;
    }
}

const getWeather = async (req, res) => {
    try {
        const activityId = new mongoose.Types.ObjectId(req.params.id);
        const activity = await Activity.findById(activityId);

        if (!activity) {
            throw new NotFoundError(`No activity with id ${activityId}`);
        }

        const lon = activity.location.coordinates.coordinates[0];
        const lat = activity.location.coordinates.coordinates[1];
        const zipCode = activity.location.zipCode;

        // Validate the zip code using USPS API
        const isValidZipCode = await validateLocationWithUSPS(zipCode);

        if (!isValidZipCode) {
            console.log(`Zip code (${zipCode}) is invalid.`);
            res.status(StatusCodes.BAD_REQUEST).json({
                error: `Zip code (${zipCode}) is invalid.`,
            });
            return;
        }
        const time = activity.time;
        const roundedTime = roundTimeToNearestHour(time).toString();

        const date = activity.date;
        const originalDate = new Date(date);
        const formattedDate = originalDate.toISOString().split('T')[0];

        // const url = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=2023-12-07&appid=${process.env.WEATHER_API_KEY}&units=imperial`;
        const url = `http://api.worldweatheronline.com/premium/v1/weather.ashx?key=${process.env.WEATHER_TRIAL_KEY}&q=${zipCode}&format=json&num_of_days=5&date=${formattedDate}&tp=1&alerts=yes`;

        const weatherData = await axiosData(url); // Await the promise to get the data

        const targetEntry = weatherData.data.weather[0].hourly.find(
            (entry) => entry.time === roundedTime,
        );

        if (targetEntry) {
            // Extract the required values
            const tempF = targetEntry.tempF;
            const weatherIconUrl = targetEntry.weatherIconUrl[0].value;
            const weatherDesc = targetEntry.weatherDesc[0].value;

            res.status(StatusCodes.OK).json({
                data: { tempF, weatherIconUrl, weatherDesc },
            });
        } else {
            console.log(
                `No entry found for the specified time (${roundedTime}).`,
            );
        }
    } catch (error) {
        console.error('Error in getWeather:', error);
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

module.exports = {
    getWeather,
};
