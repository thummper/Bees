const randomColour = require('randomcolor');

export default class MapLocation{
    constructor(cellPoints, centerPoint){
        this.cellPoints  = cellPoints;
        this.centerPoint = centerPoint;
        this.colour = randomColour({ hue: 'red'});

    }

    // Passed camera coords, return true if center point is visible
    visible(display, padding = 100){
        let x = this.centerPoint[0];
        let y = this.centerPoint[1];
        let xvis = x + padding > display.x || x - padding > ( display.x + display.width);
        let yvis = y + padding > display.y || y - padding > ( display.y + display.height);
        return xvis || yvis;
    }
}
