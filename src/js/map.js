const {Delaunay} = require('d3-delaunay');
const SeedRandom = require('seedrandom');



import customVoronoi from './customVoronoi.js';
import {Cell, Corner} from './cell.js';
import ColourHandler from './colourHandler.js';
import SimplexNoise from 'simplex-noise';
import {Queue, Bounding, edgeDistance, maxMinAvg} from './helper/util.js';
import {randomNumber, perpendicularDistance} from './helper.js';






const d3 = require('d3-color');
const dint = require('d3-interpolate');
const randomColour = require('randomcolor');
export default class Map {
    constructor(options) {
        // General map vars
        this.minx = options.x;
        this.miny = options.y;
        this.maxx = options.width;
        this.maxy = options.height;

        this.seed      = options.seed;
        this.numPoints = options.numPoints;


        this.center = {
            x: (this.maxx + this.minx) / 2,
            y: (this.maxy + this.miny) / 2
        }



        this.equator = {};
        this.points     = [];
        this.cells      = [];
        this.waterCells = [];
        this.landCells  = [];
        this.mountainCells = [];
        this.edgeCells  = [];
        this.cornerMap  = [];

        this.mountainScale = 1000;
        this.oceanScale    = 3500;
        this.moistureScale = 2200;

        this.randomGen  = null;
        this.delaunay   = null;
        this.voronoi    = null;
        this.simplex    = null;

        this.oceanNoise    = null;
        this.moistureNoise = null;

        // Control Lloyd relaxation
        this.relaxCounter = 0;
        this.maxRelax     = 3;
        // Terrain information
        this.lowestHeight  = null;
        this.highestHeight = null;
        this.seaLevel      = null;
        this.biomeColours  = {};

        this.colourHandler = new ColourHandler();

        // Important - generate the map!
        this.initRandom();
        this.initSimplex();
        this.initBiomeColours();
        this.generateMap();
        this.generateEquator();
    }

    // Get random seed for points
    initRandom() {
        this.randomGen = SeedRandom(this.seed);
    }

    initSimplex() {
        // Expensive to run this?
        this.simplex       = new SimplexNoise();
        this.oceanNoise    = new SimplexNoise();
        this.moistureNoise = new SimplexNoise();

    }

    initBiomeColours() {
        this.biomeColours['land'] = d3.hsl(randomColour({ hue : 'red', luminosity: 'dark'}));
        console.log(this.biomeColours);
    }

    // Pick random gradient and generate line that passes though center point of the map
    generateEquator() {
        let m = randomNumber(-4, 4);
        let c = this.center.y - (this.center.x * m);
        let start = {
            x: this.minx,
            y: (this.minx * m) + c
        };
        let end = {
            x: this.maxx -this.minx,
            y: ( (this.maxx - this.minx) * m) + c
        };
        this.equator = {m: m, c: c, start: start, end:end};

        // Assign cell equator distance
        let distances = [];
        for(let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            let point = {x: cell.x, y: cell.y};
            let distance = perpendicularDistance(point, this.equator);
            distances.push(distance);
            cell.equatorDistance = distance;
        }

        let [max, min, average] = maxMinAvg(distances);
        // Normalize cell distances
        for(let i = 0; i< this.cells.length; i++) {
            let cell = this.cells[i];
            cell.equatorDistance = ((cell.equatorDistance - min) / (max - min)) * 100;
        }
    }


    generatePoints() {
        for(let i = 0; i < this.numPoints; i++) {
            let rx = this.randomGen() * (this.maxx - this.minx) + this.minx;
            let ry = this.randomGen() * (this.maxy - this.miny) + this.miny;
            this.points.push([rx, ry]);
        }
    }



    // General function call to generate map
    generateMap() {
        // Generate points
        this.generatePoints();
        // Generate 1st map
        this.generateVoronoi();
        // Relax the map
        while(this.relaxCounter < this.maxRelax){
            this.relaxMap();
            this.relaxCounter += 1;
        };

        // Now we have final map
        this.createCellCorners();
        this.attachCellNeighbours();
        // Attach height values to corners
        // this.giveCornerHeight();
        this.assignWater();
        this.assignMoisture();

    }

    generateVoronoi() {
        this.delaunay = Delaunay.from(this.points);
        this.voronoi  = new customVoronoi(this.delaunay, [this.minx, this.miny, this.maxx, this.maxy]);
        this.generateCells();
    }

    // Generate a list of cells
    generateCells() {
        // Get map bounding
        let bounding = new Bounding(this.minx, this.miny, this.maxx, this.maxy);
        let eDists   = [];
        for(let i = 0; i < this.numPoints; i++) {
            let cellPoints  = this.voronoi.getCell(i);
            let centerPoint = this.points[i];
            let cell = new Cell(cellPoints, centerPoint);
            let edgeDist      = edgeDistance(cell.x, cell.y, bounding);
            cell.edgeDistance = edgeDist;
            eDists.push(edgeDist);
            this.cells.push(cell);
        }
        let [max, min, avg] = maxMinAvg(eDists);


        // Normalise edge distance
        let normDist = [];
        for(let c in this.cells) {
            let cell = this.cells[c];
            let normDistance = ((cell.edgeDistance - min) / (max - min)) * 100;
            //console.log( cell.edgeDistance - min, max - min, normDistance);
            //console.log("ED: ", cell.edgeDistance, " ND: ", normDistance);
            cell.edgeDistance = normDistance;
            normDist.push(normDistance);
        }
    }

    assignMoisture() {
        let noiseVals = [];
        for(let c in this.cells) {
            let cell  = this.cells[c];
            let tempRandom = randomNumber(this.moistureScale / 0.85, this.moistureScale);
            let noise = this.moistureNoise.noise2D(cell.x / tempRandom, cell.y / tempRandom);
            noiseVals.push(noise);
            cell.moisture = noise;

        }
        let [max, min, avg] = maxMinAvg(noiseVals);
        for(let c in this.cells) {
            let cell = this.cells[c];
            cell.moisture = ((cell.moisture - min) / (max - min)) * 100;
            //console.log(cell.moisture);
        }
    }

    assignWater() {
        // Use ocean noise to assign water
        let noiseVals = [];
        for(let c in this.cells) {
            let cell = this.cells[c];
            // Sample noise
            let noise = this.oceanNoise.noise2D(cell.x / this.oceanScale, cell.y / this.oceanScale);
            let nVal = (cell.edgeDistance / 100) + (noise / 1.6);

            noiseVals.push(nVal);
            if(nVal < 0.3 ) {
                this.setCellBiome(cell, "water");
                this.waterCells.push(cell);
            } else {
                this.setCellBiome(cell, 'land');
                this.landCells.push(cell);
            }
        }

        // Once all water has been assigned we need to determine what is ocean / freshwater
        // Loop through our edge cells:
        // - If cell is edge:
        //   - Set biome to ocean
        //   - Add water neighbours to the queue (if not already in queue?)
        let edgeCells  = [];
        for(let c in this.waterCells) {
            let cell = this.waterCells[c];
            if(cell.edge) {
                edgeCells.push(cell);
            }
        }

        // Everything in waterQueue will be assigned ocean
        let waterQueue = new Queue(edgeCells);
        while(waterQueue.length() > 0) {
            // Get item
            let cell = waterQueue.dequeue();
            if(cell.biome == "water") {
                this.setCellBiome(cell, "ocean");
                // All water neighbours of this cell will be assigned ocean.
                let neighbours = cell.neighbours;
                waterQueue.addElements(neighbours);
            }
        }

    }



    // Give corners height values
    giveCornerHeight() {
        // Loop though all corners
        let lowestHeight  = Infinity;
        let highestHeight = 0;
        if(this.cornerMap.length > 0) {
            for(let key in this.cornerMap) {
                let corner = this.cornerMap[key];
                let height = this.simplex.noise2D(corner.x / 8000, corner.y / 8000);
                corner.height = height;
                if(height > highestHeight) {
                    highestHeight = height;
                }
                if(height < lowestHeight) {
                    lowestHeight = height;
                }

            }
            // Normalise colour
            for(let key in this.cornerMap) {
                let corner = this.cornerMap[key];
                let normHeight = (corner.height - lowestHeight) / (highestHeight - lowestHeight);
                corner.normHeight = normHeight;
            }
        }
        this.lowestHeight  = lowestHeight;
        this.highestHeight = highestHeight;

        // let range = ((Math.abs(lowestHeight) + Math.abs(highestHeight)) * 0.35);
        // console.log(" RANGE: ", range);
        // this.seaLevel = lowestHeight + range;
        // console.log("Lowest: ", lowestHeight, " Highest: ", highestHeight, " Sea level: ", this.seaLevel);
        this.seaLevel = 0.35;
        this.giveCellsHeight();
    }

    // Given that corners have height values, the height value of a cell will be given by averaging the corner vals
    giveCellsHeight() {
        for(let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            let corners = cell.corners;
            let heightTotal = 0;
            for(let j = 0; j < corners.length; j++) {
                heightTotal += corners[j].height;
            }
            let heightAverage = heightTotal / corners.length;
            cell.height = (heightAverage - this.lowestHeight) / (this.highestHeight - this.lowestHeight);

            // if(cell.height <= this.seaLevel) {
            //     // Scale again
            //     cell.height = (cell.height) / (this.seaLevel);
            //     this.setCellBiome(cell, "water");

            // } else {
            //     cell.height = (cell.height - this.seaLevel) / (1 - this.seaLevel);
            //     this.setCellBiome(cell, "land");
            // }
        }
    }

    // Set cell biome
    setCellBiome(cell, biome){
        cell.setBiome(biome);
        this.colourHandler.setColour(cell);
        // if(biome == "land") {
        //     cell.colour = dint.interpolateRgb("goldenrod", "darkgoldenrod")(cell.height);
        // } else {
        //     cell.colour = dint.interpolateRgb("dodgerblue", "deepskyblue")(cell.height);
        // }
    }

    // Create all cell corners here, making sure they are unique
    createCellCorners() {
        for(let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            let cornerPoints = cell.cellPoints;

            let tempCorners  = [];
            // TODO: refactor
            // Might do two loops to help my small loop
            // #1 - Create all corners and also add them to a temp array
            for(let j = 0; j < cornerPoints.length; j+=2) {
                let edge = false;
                let x = cornerPoints[j];
                let y = cornerPoints[j+1];
                // Check if corner is on the edge of the map
                if(x <= this.minx || x >= this.maxx || y <= this.miny || y >= this.maxy) {
                    // console.log("Edge corner");
                    edge = true;
                }
                // Create key to ensure corner is unique
                let cornerName = x.toString() + y.toString();
                // Corner has not been created before
                if(!(cornerName in this.cornerMap)) {
                    let corner   = new Corner(x, y);
                    if(edge) {
                        // Assign edge if edge point
                        corner.edge = true;
                        cell.edge   = true;
                    }
                    cell.corners.push(corner);
                    this.cornerMap[cornerName] = corner;
                    tempCorners.push(corner);

                } else {
                    // Corner has already been created.
                    cell.corners.push( this.cornerMap[cornerName]);
                    tempCorners.push(this.cornerMap[cornerName]);
                }
            }

            // #2 - Loop through corners and add appropriate connections
            // Basically corner n connects to n-1 and n+1, result of sum will wrap to start / end of array
            for(let j = 0; j < tempCorners.length; j++) {
                // Get current corner
                let corner = tempCorners[j];
                // This corner connects to the next corner
                let nextInd = j + 1;
                let lastInd = j - 1;
                // Make indices wrap
                if(nextInd >= tempCorners.length) {
                    nextInd = 0;
                }
                if(lastInd < 0){
                    lastInd = tempCorners.length - 1;
                }

                corner.addConnection( tempCorners[lastInd] );
                corner.addConnection( tempCorners[nextInd] );
            }
        }
    }

    // Loops through cells, finds their neighbours and attaches them
    attachCellNeighbours() {
        let cells = this.cells;
        let cellLength = cells.length;
        console.log(cells);
        // For each cell
        for(let c = 0; c < cellLength; c++) {
            let cell = cells[c];
            // Check all other cells (nested loop though?)
            for(let d = 0; d < cellLength; d++) {
                // Compare cells that are not c
                if(d != c){
                    let testCell = cells[d];
                    // If test cell shares any corner with cell, it is a neighbour of cell and cell is a neighbour of test cell.
                    if(cell.isNeighbour(testCell)){
                        // Assign cell as neighbour.
                        cell.addNeighbour(testCell);
                        testCell.addNeighbour(cell);
                    }
                }
            }
        }
    }

    resetVoronoi() {
        this.delaunay = null;
        this.voronoi  = null;
        this.cells     = [];
        this.cornerMap = [];
    }

    // Apply lloyd relaxation iteratively
    relaxMap(){
        this.lloydRelaxation();
        this.resetVoronoi();
        this.generateVoronoi();
    }


    // Apply Lloyd relaxation to make voronoi cells more uniform (should make a better map)
    lloydRelaxation() {
        let newPoints = [];
        for(let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            let centerPoint = cell.centerPoint;
            let corners     = cell.cellPoints;
            let xtally = 0;
            let ytally = 0;

            for( let j = 0; j < corners.length; j +=2) {
                xtally += corners[j];
                ytally += corners[j + 1];
            }

            let xavg = xtally / Math.floor(corners.length / 2);
            let yavg = ytally / Math.floor(corners.length / 2);

            // Just average the corners to get the cell's centroid, this will be the new point
            newPoints.push([xavg, yavg]);
            // TODO: We could move in a weighted direction towards the average as relaxed map seems a bit too nice?
        }
        console.log(" Points: ", this.points.length, " New: ", newPoints.length);
        this.points = newPoints;

    }

    // Given camera info, get all cells that are on screen
    getCells(display) {
        let visibleCells = [];
        for(let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            if(cell.visible(display, 100)) {
                visibleCells.push(cell);
            }
        }
        return visibleCells;
    }

// End Map
};