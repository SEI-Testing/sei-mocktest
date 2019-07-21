const dbapi = require('./dbapi');
const swissapi = require('./swissapi');
const benzinapi = require('./benzinapi');
const routingapi = require('./googlemapswrapper');

const emailService = require('./email');


module.exports = function(targetcity, date, myHourPrice, myEmailAdress) {
    let bahnPrice = dbapi.getPrice(targetCity, date);
    let flightPrice = swissapi.getPrice(targetCity, date);
    let currentDieselPrice = benzinapi.getPricePreLitre('diesel', targetcity);
    let routeByCar = routingapi.getRoute('Zürich', 'Munich');

    let carPrice = {
        type: 'car',
        duration: routeByCar.duration,
        price: routeByCar.distance * currentDieselPrice
    };

    let options = [bahnPrice, flightPrice, carPrice].map((obj) => {obj.cost = obj.duration * myHourPrice / 60 + obj.price; return obj;});

    let best = {
        cost: Number.NEGATIVE_INFINITY
    };

    options.forEach((opt) => {if (opt.cost < best.cost) {best = opt;}});

    emailService.sendMail(myEmailAdress, 'Best Travel Option', 'The best travel option to go to ' + targetcity +
        ' on: ' + date + ' is to go by ' + best.type + '. ' + JSON.stringify(best));
};