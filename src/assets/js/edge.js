
export default class Edge {
    // An edge will always have two corners and multiple possible cells associated with it.
    constructor(start, end) {
        this.start  = start;
        this.end    = end;
        this.points = [];

        this.cells   = [];
    }

    addCells(cells) {
        for(let c in cells) {
            let cell = cells[c]
            if(!this.cells.includes(cell)) {
                this.cells.push(cell);
                cell.addEdge(this);
            }
        }
    }
}