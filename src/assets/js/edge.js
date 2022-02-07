
export default class Edge {
    // An edge will always have two corners and multiple possible cells associated with it.
    constructor(corners) {
        this.corners = corners;
        this.cells   = [];
    }

    addCells(cells){
        for(let cell in cells) {
            if(!this.cells.includes(cell)) {
                this.cells.push(cell);
            }
        }
    }
}