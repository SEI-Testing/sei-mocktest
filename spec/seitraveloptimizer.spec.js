describe('SEI Travel optimzer optimizes my journey to the next camp', () => {

    let traveloptimizer;

    beforeEach (() => {
        traveloptimizer = require('../seitraveloptimizer');
    });

    it('should suggest the car if train and flight are very expensice', ()=> {

        traveloptimizer.optimize('München', new Date(), 30, 'reto@blunschi.ch');

    })
});