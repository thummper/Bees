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