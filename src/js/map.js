const {Delaunay} = require('d3-delaunay');
const SeedRandom = require('seedrandom');

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
        this.voronoi  = this.delaunay.voronoi([this.startX, this.startY, this.width, this.height]);
    }
// End Map
};