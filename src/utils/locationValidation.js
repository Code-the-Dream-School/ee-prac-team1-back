const axios = require('axios');
const xmlbuilder2 = require('xmlbuilder2');


const createUSPSRequestXML = (location) => {
    const { address, city, state, zipCode } = location;
    const uppercaseLocation = {
        address: address.toUpperCase(),
        city: city.toUpperCase(),
        state: state.toUpperCase(),
        zipCode: zipCode.toUpperCase()
    };
    return xmlbuilder2.create({ version: '1.0' })
        .ele('AddressValidateRequest', { USERID: '6F83CODET2789' })
        .ele('Address')
        .ele('Address1').txt(uppercaseLocation.address).up()
        .ele('Address2').txt().up()
        .ele('City').txt(uppercaseLocation.city).up()
        .ele('State').txt(uppercaseLocation.state).up()
        .ele('Zip5').txt(uppercaseLocation.zipCode).up()
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
        if (correctedCity.toUpperCase() !== location.city.toUpperCase()) {
            console.error('Error in validateLocationWithUSPS: Incorrect City');
            throw new Error('Incorrect City input');
        }
        const correctedState = obj.AddressValidateResponse.Address.State;
        if (correctedState.toUpperCase() !== location.state.toUpperCase()) {
            console.error('Error in validateLocationWithUSPS: Incorrect State');
            throw new Error('Incorrect State input');
        }

        const correctedZip5 = obj.AddressValidateResponse.Address.Zip5;
        if (correctedZip5 !== location.zipCode) {
            console.error('Error in validateLocationWithUSPS: Incorrect ZipCode');
            throw new Error('Incorrect ZipCode input');
        }
        return obj;
    } catch (error) {
        console.error('Error in validateLocationWithUSPS:', error);

        let errorMessage;
        if (error.message === 'Incorrect City') {
            errorMessage = 'Invalid city. Please check the city name.';
        } else if (error.message === 'Incorrect State') {
            errorMessage = 'Invalid state. Please check the state abbreviation.';
        } else if (error.message === 'Incorrect ZipCode') {
            errorMessage = 'Invalid ZIP code. Please check the ZIP code.';
        } else {
            errorMessage = 'Error validating location with USPS.';
        }
        throw new Error(errorMessage + ' ' + error.message);
    }
};


module.exports = { validateLocationWithUSPS };