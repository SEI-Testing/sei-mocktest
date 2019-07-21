const dbapi = require('./dbapi');
const swissapi = require('./swissapi');
const benzinapi = require('./benzinapi');
const routingapi = require('./googlemapswrapper');

const emailService = require('./email');


module.exports = {

    optimize: function (targetCity, date, myHourCost, literPer100k, myEmailAddress) {

        // Get Rail price and duration by calling the Deutsche Bahn API
        // expect an object: {type: 'bahn', duration: Number in Minutes, price: Number}
        let bahnPrice = dbapi.getPrice(targetCity, date);

        // Get Flight price and duration by calling the Swiss API
        // expect an object: {type: 'flight', duration: Number in Minutes, price: Number}
        let flightPrice = swissapi.getPrice(targetCity, date);

        // get the current Diesel Price in the target City
        let currentDieselPrice = benzinapi.getPricePerLitre('diesel', targetCity);

        // get a route from Zurich to the Target City from google Maps
        // expect an Object: {duration: Number in Minutes, distance: Number in km}
        let routeByCar = routingapi.getRoute('Zürich', targetCity);

        // calculate the car price: Diesel-Price * km + 0.5c per km for the car
        let carPrice = {
            type: 'car',
            duration: routeByCar.duration,
            price: routeByCar.distance / 100 * literPer100k * currentDieselPrice + routeByCar.distance * 0.5
        };

        // add in the perceived costs by using the the passed in perceived Costs per hour of travelling.
        let options = [bahnPrice, flightPrice, carPrice].map((obj) => {
            obj.perceivedCost = obj.duration * myHourCost / 60 + obj.price;
            return obj;
        });

        // get the option with the lowest cost.
        let best = {
            perceivedCost: Number.POSITIVE_INFINITY
        };

        options.forEach((opt) => {
            if (opt.perceivedCost < best.perceivedCost) {
                best = opt;
            }
        });

        // send an email with the best option to the specified address
        emailService.sendMail(myEmailAddress, 'Best Travel Option', best);
    }
};