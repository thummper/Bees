

export default class Cell {
    constructor(cellPoints = [], centerPoint = []) {

        if(centerPoint.length > 0) {
            this.x = centerPoint[0];
            this.y = centerPoint[1];
        } else {
            this.x = null;
            this.y = null;
        }


        this.cellPoints  = cellPoints;
        this.centerPoint = centerPoint;
        this.colour      = "black";
        this.corners     = [];
        this.neighbours  = [];
        this.edges       = [];

        // Terrain vars
        this.edgeDistance = null;
        this.height       = null;
        this.normHeight   = null;
        this.biome        = null;
    }

    // TODO: temp? Temp biome set
    setBiome(biome) {
        this.biome = biome;
    }

    // Add edge
    addEdge(edge) {
        if(!this.edges.includes(edge)) {
            this.edges.push(edge);
        }

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
}
