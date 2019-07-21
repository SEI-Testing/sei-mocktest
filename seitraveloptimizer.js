const dbapi = require('./dbapi');
const swissapi = require('./swissapi');
const benzinapi = require('./benzinapi');
const routingapi = require('./googlemapswrapper');

const emailService = require('./email');


module.exports = {

    optimize: function (targetCity, date, myHourPrice, literPer100k, myEmailAdress) {
        let bahnPrice = dbapi.getPrice(targetCity, date);
        let flightPrice = swissapi.getPrice(targetCity, date);
        let currentDieselPrice = benzinapi.getPricePerLitre('diesel', targetCity);
        let routeByCar = routingapi.getRoute('Zürich', targetCity);

        let carPrice = {
            type: 'car',
            duration: routeByCar.duration,
            price: routeByCar.distance / 100 * literPer100k * currentDieselPrice + routeByCar.distance * 0.5
        };

        let options = [bahnPrice, flightPrice, carPrice].map((obj) => {
            obj.perceivedCost = obj.duration * myHourPrice / 60 + obj.price;
            return obj;
        });

        let best = {
            perceivedCost: Number.POSITIVE_INFINITY
        };

        options.forEach((opt) => {
            if (opt.perceivedCost < best.perceivedCost) {
                best = opt;
            }
        });

        emailService.sendMail(myEmailAdress, 'Best Travel Option', best);
    }
};