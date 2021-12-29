const {Delaunay} = require('d3-delaunay');
const SeedRandom = require('seedrandom');
const Noise = require('noisejs');

import customVoronoi from './customVoronoi.js';
import {Cell, Corner} from './cell.js';
import ColourHandler from './colourHandler.js';
import SimplexNoise from 'simplex-noise';
import Queue from './helper/queue.js';
import { tychei } from 'seedrandom';




const d3 = require('d3-color');
const dint = require('d3-interpolate');
const randomColour = require('randomcolor');
export default class Map {
    constructor(options) {
        // General map vars
        this.seed   = options.seed;
        this.startX = options.x;
        this.startY = options.y;
        this.width  = options.width;
        this.height = options.height;
        this.numPoints = options.numPoints;


        this.points     = [];
        this.cells      = [];
        this.waterCells = [];
        this.landCells  = [];
        this.edgeCells  = [];
        this.cornerMap  = [];

        this.randomGen  = null;
        this.delaunay   = null;
        this.voronoi    = null;
        this.simplex    = null;

        this.oceanNoise    = null;
        this.mountainNoise = null;
        // Control Lloyd relaxation
        this.relaxCounter = 0;
        this.maxRelax     = 1;
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
    }

    initBiomeColours(){
        this.biomeColours['land'] = d3.hsl(randomColour({ hue : 'red', luminosity: 'dark'}));
        console.log(this.biomeColours);
    }

    initSimplex() {
        // Expensive to run this?
        this.simplex       = new SimplexNoise();
        this.oceanNoise    = new SimplexNoise();
        this.mountainNoise = new SimplexNoise();
    }

    // Get random seed for points
    initRandom() {
        this.randomGen = SeedRandom(this.seed);
    }

    generatePoints() {
        for(let i = 0; i < this.numPoints; i++){
            let rx = this.randomGen() * (this.width - this.startX) + this.startX;
            let ry = this.randomGen() * (this.height - this.startY) + this.startY;
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
        this.relaxMap();
        // Now we have final map
        this.createCellCorners();
        this.attachCellNeighbours();
        // Attach height values to corners
        // this.giveCornerHeight();
        this.assignWater();
    }

    generateVoronoi() {
        this.delaunay = Delaunay.from(this.points);
        this.voronoi  = new customVoronoi(this.delaunay, [this.startX, this.startY, this.width, this.height]);
        // Relaxation needs cells, so keeping this function here.
        this.generateCells();
    }

    // Generate a list of cells
    generateCells() {
        for(let i = 0; i < this.numPoints; i++) {
            let cellPoints  = this.voronoi.getCell(i);
            let centerPoint = this.points[i];
            let location = new Cell(cellPoints, centerPoint);
            this.cells.push(location);
        }
    }

    assignWater() {
        // Use ocean noise to assign water
        for(let c in this.cells) {
            let cell = this.cells[c];
            // Sample noise
            let nVal = this.oceanNoise.noise2D(cell.x / 5000, cell.y / 5000);
            if(nVal < 0.05 ) {
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

    assignMountains() {
        // Use mountain noise to assign mountains
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
                if(x <= this.startX || x >= this.width || y <= this.startY || y >= this.height) {
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
        while(this.relaxCounter < this.maxRelax){
            this.lloydRelaxation();
            this.resetVoronoi();
            this.generateVoronoi();
            this.relaxCounter += 1;
        }
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