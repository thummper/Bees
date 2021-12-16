const randomColour = require('randomcolor');

export default class MapLocation{
    constructor(cellPoints, centerPoint){
        this.cellPoints  = cellPoints;
        this.centerPoint = centerPoint;
        this.colour = randomColour();

    }

    // Passed camera coords, return true if center point is visible
    visible(display, padding = 100){
        let x = this.centerPoint[0];
        return x + padding > display.x || x - padding > ( display.x + display.width)
    }
}
