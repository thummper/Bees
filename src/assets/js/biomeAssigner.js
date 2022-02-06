
export default class BiomeAssigner {
    constructor() {
        // Build a 100x100 matrix
        this.biomeGrid = new Array(100).fill(null).map(()=>new Array(100).fill(null));
        this.buildGrid();
    }


    buildGrid() {
        console.log("Making grid");
        // Rows are temperature, columns are moisture
        for(let i in this.biomeGrid) {

            for(let j in this.biomeGrid[i]) {
                // Temperature is i, moisture is j
                if(i < 10 && j < 10) {
                    this.biomeGrid[i][j] = "tundra";
                } else if (i < 25 && j < 25) {
                    this.biomeGrid[i][j] = "boreal";
                } else if (i < 50 && j < 25) {
                    this.biomeGrid[i][j] = "grassland";
                } else if (i < 50 && j < 50) {
                    this.biomeGrid[i][j] = "woodland";
                } else if (i < 50 && j < 75) {
                    this.biomeGrid[i][j] = "forest";
                } else if (i < 50 && j < 100) {
                    this.biomeGrid[i][j] = "rainforest";
                } else if (i < 100 && j < 15) {
                    this.biomeGrid[i][j] = "desert";
                } else if (i < 100 && j < 50) {
                    this.biomeGrid[i][j] = "savannah";
                } else if (i < 100 && j < 100) {
                    this.biomeGrid[i][j] = "tropical_rainforest"
                }
            }
        }
        //Grid done
        // for(let i in this.biomeGrid) {
        //     for(let j in this.biomeGrid){
        //         console.log("T: ", i, " M: ", j, " ", this.biomeGrid[i][j]);
        //     }
        // }
    }
}