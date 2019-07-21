const dbapi = require('./dbapi');
const swissapi = require('./swissapi');
const benzinapi = require('./benzinapi');
const routingapi = require('./googlemapswrapper');

const emailService = require('./email');


module.exports = {

    optimize: function (targetCity, date, myHourPrice, myEmailAdress) {
        let bahnPrice = dbapi.getPrice(targetCity, date);
        let flightPrice = swissapi.getPrice(targetCity, date);
        let currentDieselPrice = benzinapi.getPricePerLitre('diesel', targetcity);
        let routeByCar = routingapi.getRoute('Zürich', 'Munich');

        let carPrice = {
            type: 'car',
            durationInMinutes: routeByCar.duration,
            price: routeByCar.distance * currentDieselPrice
        };

        let options = [bahnPrice, flightPrice, carPrice].map((obj) => {
            obj.perceivedCost = obj.durationInMinutes * myHourPrice / 60 + obj.price;
            return obj;
        });

        let best = {
            perceivedCost: Number.NEGATIVE_INFINITY
        };

        options.forEach((opt) => {
            if (opt.perceivedCost < best.perceivedCost) {
                best = opt;
            }
        });

        emailService.sendMail(myEmailAdress, 'Best Travel Option', 'The best travel option to go to ' + targetcity +
            ' on: ' + date + ' is to go by ' + best.type + ': ' + JSON.stringify(best));
    }
};