const axios = require('axios');
const xmlbuilder2 = require('xmlbuilder2');


const createUSPSRequestXML = (location) => {
    const { address, city, state, zipCode } = location;
    return xmlbuilder2.create({ version: '1.0' })
        .ele('AddressValidateRequest', { USERID: '6F83CODET2789' })
        .ele('Address')
        .ele('Address1').txt(address).up()
        .ele('Address2').txt().up()
        .ele('City').txt(city).up()
        .ele('State').txt(state).up()
        .ele('Zip5').txt(zipCode).up()
        .ele('Zip4').up()
        .up()
        .end({ prettyPrint: true });
};

const validateLocationWithUSPS = async (location) => {
    try {
        const xml = createUSPSRequestXML(location);
        console.log('USPS API Request XML:', xml);

        const url = 'https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&xml=' + encodeURIComponent(xml);

        const response = await axios.get(url);
        const obj = xmlbuilder2.convert(response.data, { format: 'object' });
        console.log('USPS API Response:', obj);

        if (obj.AddressValidateResponse.Address.Error) {
            throw new Error(obj.AddressValidateResponse.Address.Error.Description);
        }
        const correctedCity = obj.AddressValidateResponse.Address.City;
        if (correctedCity !== location.city) {
            console.error('Error in validateLocationWithUSPS: Incorrect City');
            throw new Error('Incorrect City');
        }
        const correctedState = obj.AddressValidateResponse.Address.State;
        if (correctedState !== location.state) {
            console.error('Error in validateLocationWithUSPS: Incorrect State');
            throw new Error('Incorrect State');
        }

        const correctedZip5 = obj.AddressValidateResponse.Address.Zip5;
        if (correctedZip5 !== location.zipCode) {
            console.error('Error in validateLocationWithUSPS: Incorrect ZipCode');
            throw new Error('Incorrect ZipCode');
        }
        return obj;
    } catch (error) {
        console.error('Error in validateLocationWithUSPS:', error);

        if (error.message === 'Incorrect City') {
            throw new Error('Invalid city. Please check the city name.');
        } else if (error.message === 'Incorrect State') {
            throw new Error('Invalid state. Please check the state abbreviation.');
        } else if (error.message === 'Incorrect ZipCode') {
            throw new Error('Invalid ZIP code. Please check the ZIP code.');
        } else {
            throw new Error('Error validating location with USPS');
        }
    }
};


module.exports = { validateLocationWithUSPS };






