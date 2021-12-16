const {Delaunay} = require('d3-delaunay');
const SeedRandom = require('seedrandom');

import customVoronoi from './custom_voronoi.js';
import MapLocation from './mapLocation.js';

export default class Map {
    constructor(options){
        // Vars
        this.seed   = options.seed;
        this.startX = options.x;
        this.startY = options.y;
        this.width  = options.width;
        this.height = options.height;
        this.numPoints = options.numPoints;

        this.points    = [];
        this.cells     = [];
        this.randomGen = null;
        this.delaunay  = null;
        this.voronoi   = null;

        // Important
        this.initRandom();
        this.generatePoints();
        this.generateVoronoi();
    }
    initRandom(){
        this.randomGen = SeedRandom(this.seed);
    }

    generatePoints(){
        for(let i = 0; i < this.numPoints; i++){
            let rx = this.randomGen() * (this.width - this.startX) + this.startX;
            let ry = this.randomGen() * (this.height - this.startY) + this.startY;

            this.points.push([rx, ry]);
        }
    }

    generateVoronoi(){
        this.delaunay = Delaunay.from(this.points);
        this.voronoi  = new customVoronoi(this.delaunay, [this.startX, this.startY, this.width, this.height]);

        this.determineCells();

    }

    // Make data structure that contains cells.
    determineCells(){

        for(let i = 0; i < this.numPoints; i++){
            let cellPoints  = this.voronoi.getCell(i);
            let centerPoint = this.points[i];
            let location = new MapLocation(cellPoints, centerPoint);
            this.cells.push(location);
        }
        console.log("Made cells: ", this.cells.length);

    }

    resetVoronoi(){
        this.delaunay = null;
        this.voronoi  = null;
        this.cells = []
        this.generateVoronoi()

    }

    // Apply Lloyd relaxation to make voronoi cells more uniform (should make a better map)
    lloydRelaxation(){
        console.log("Relaxing");
        let newPoints = [];
        for(let i = 0; i < this.cells.length; i++){
            let cell = this.cells[i];
            let centerPoint = cell.centerPoint;
            let corners     = cell.cellPoints;

            let xtally = 0;
            let ytally = 0;

            let n = corners.length;

            // IDK what this does, from d3 code
            while (corners[0] === corners[n-2] && corners[1] === corners[n-1] && n > 1) n-=2;
            for( let j = 0; j < n; j += 2){
                xtally += corners[j];
                ytally += corners[j + 1];
            }

            let xavg = xtally / n;
            let yavg = ytally / n;

            // Just average the corners to get the cell's centroid, this will be the new point
            newPoints.push([xavg, yavg]);
        }
        console.log(" Points: ", this.points.length, " New: ", newPoints.length);
        this.points = newPoints;
        this.resetVoronoi();
    }



    // Given camera informat, get all cells that are on screen
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