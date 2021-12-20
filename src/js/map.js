const {Delaunay} = require('d3-delaunay');
const SeedRandom = require('seedrandom');

import customVoronoi from './custom_voronoi.js';
import {MapLocation, Corner} from './mapLocation.js';

export default class Map {
    constructor(options) {
        // Vars
        this.seed   = options.seed;
        this.startX = options.x;
        this.startY = options.y;
        this.width  = options.width;
        this.height = options.height;
        this.numPoints = options.numPoints;


        this.points    = [];
        this.cells     = [];
        this.cornerMap = [];
        this.randomGen = null;
        this.delaunay  = null;
        this.voronoi   = null;

        this.relaxCounter = 0;
        this.maxRelax     = 1;

        // Important
        this.initRandom();
        this.generateMap();
    }

    // Get random seed for points
    initRandom(){
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
            let location = new MapLocation(cellPoints, centerPoint);
            this.cells.push(location);
        }
    }

    // Create all cell corners here, making sure they are unique
    createCellCorners(){
        for(let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            let cornerPoints = cell.cellPoints;

            // Loop through corner points.
            for(let j = 0; j < cornerPoints.length; j+=2) {
                let x = cornerPoints[j];
                let y = cornerPoints[j+1];
                let cornerName = x.toString() + y.toString();
                // Corner has not been created before
                if(!(cornerName in this.cornerMap)){
                    let corner   = new Corner(x, y);
                    cell.corners.push(corner);
                    this.cornerMap[cornerName] = corner;
                } else {
                    // Corner has already been created.
                    cell.corners.push( this.cornerMap[cornerName]);
                }
            }

        }
        console.log(this.cornerMap);
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

    resetVoronoi(){
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
    lloydRelaxation(){
        let newPoints = [];
        for(let i = 0; i < this.cells.length; i++){
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
    getCells(display){
        let visibleCells = [];
        for(let i = 0; i < this.cells.length; i++){
            let cell = this.cells[i];
            if(cell.visible(display, 100)){
                visibleCells.push(cell);
            }
        }
        return visibleCells;
    }

// End Map
};