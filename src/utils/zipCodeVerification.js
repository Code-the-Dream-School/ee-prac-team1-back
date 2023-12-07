const axios = require('axios');
const xmlbuilder2 = require('xmlbuilder2');

const USPS_USERID = '6F83CODET2789'; // Replace with your actual USPS USERID

const createUSPSRequestXML = (zipCode) => {
    const uppercaseZipCode = zipCode.toUpperCase();

    return xmlbuilder2
        .create({ version: '1.0' })
        .ele('CityStateLookupRequest', { USERID: USPS_USERID })
        .ele('ZipCode', { ID: '0' })
        .ele('Zip5')
        .txt(uppercaseZipCode)
        .up()
        .up()
        .end({ prettyPrint: true });
};

const validateLocationWithUSPS = async (zipCode) => {
    try {
        const xml = createUSPSRequestXML(zipCode);

        const url = `https://secure.shippingapis.com/ShippingAPI.dll?API=CityStateLookup&xml=${encodeURIComponent(
            xml,
        )}`;

        const response = await axios.get(url);
        const obj = xmlbuilder2.convert(response.data, { format: 'object' });

        if (obj.CityStateLookupResponse.Error) {
            // Return false if there is an error in the response
            return false;
        }

        // Return true if the response contains a city value, false otherwise
        return !!obj.CityStateLookupResponse.ZipCode.City;
    } catch (error) {
        // Return false in case of any error
        return false;
    }
};

module.exports = { validateLocationWithUSPS };
