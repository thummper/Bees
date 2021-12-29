const randomColour = require('randomcolor');

class Cell {
    constructor(cellPoints, centerPoint) {
        this.x = centerPoint[0];
        this.y = centerPoint[1];
        this.cellPoints  = cellPoints;
        this.centerPoint = centerPoint;
        this.colour      = "black";
        this.corners     = [];
        this.neighbours  = [];

        // Terrain vars
        this.height     = null;
        this.normHeight = null;
        this.biome      = null;
    }

    // TODO: temp? Temp biome set
    setBiome(biome) {
        this.biome = biome;
    }

    // Add neighbour
    addNeighbour(cell) {
        if(!this.neighbours.includes(cell)) {
            this.neighbours.push(cell);
        }
    }

    // Test if cell is neighbour of this cell
    isNeighbour(testCell) {
        let testCorners    = testCell.corners;
        let currentCorners = this.corners;
        // Check all current corners
        for(let i = 0; i < currentCorners.length; i++) {
            let corner = currentCorners[i];
            // Against test corners
            for(let j = 0; j < testCorners.length; j++) {
                let testCorner = testCorners[j];
                // If any match, testCell is a neighbour
                if(corner == testCorner) {
                    return true;
                }
            }
        }
        // We have checked every cell
        return false;
    }

    // Passed camera coords, return true if center point is visible
    visible(display, padding = 100) {
        let x = this.centerPoint[0];
        let y = this.centerPoint[1];
        let xvis = x + padding > display.x || x - padding > ( display.x + display.width);
        let yvis = y + padding > display.y || y - padding > ( display.y + display.height);
        return xvis || yvis;
    }
};

class Corner {
    constructor(xpos, ypos) {
        this.x = xpos;
        this.y = ypos;
        // Store corner connections
        this.connections = [];
        // Cells that own this corner
        this.cells       = [];
        // TODO: Altitude, rivers.
        // Terrain information
        this.height = null;
    }

    addConnection(corner) {
        if(!this.connections.includes(corner)) {
            this.connections.push( {"corner": corner, "colour": randomColour({ hue: 'purple'})});
        }
    }
    addCell(cell) {
        if(!this.cells.includes(cell)) {
            this.cells.push(cell);
        }
    }
}

module.exports = {Cell, Corner};
