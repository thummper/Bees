// Code for fuzzy edges - not sure if feasible / my brain is too small
makeFuzzyEdges() {
    for(let i = 0; i < this.edges.length; i++) {
        let edge = this.edges[i];
        let edgeCells = edge.cells;

        if(edgeCells.length != 2) {
            console.log(" This edge does not have 2 cells associated with it: ", edgeCells.length);
        } else {
            // We have 2 cells.
            // We want to draw a line from start to end
            // Get the line that links the two cells
            let cellLine = this.getCellLine(edgeCells);
            // Pick an x coord inbetween the cells
            let x1 = edgeCells[0].x;
            let x2 = edgeCells[1].x;

            let dx = x2 - x1;
            let mid = x1 + (dx / 2);


            let division = randomNumber(0.4, 0.6);

            let randX = randomNumber(x1, x2);
            let y     = (mid * cellLine.m) + cellLine.c;

            // Add this point to the edge.
            edge.points.push({x: randX, y: y});

            console.log(edge);



        }
    }
}


// Create cell edges
createCellEdges() {
    let cornerKeys = Object.keys(this.cornerMap);
    let edgeMap = {};

    // Loop through every corner
    for(let i = 0; i < cornerKeys.length; i++) {
        // For each corner
        let corner = this.cornerMap[cornerKeys[i]];
        // Get its connections
        let connections = corner.connections;
        // For each connection
        for(let j = 0; j < connections.length; j++) {
            // Try and make a unique edge
            let connection = connections[j];
            let conCorner  = connection.corner;
            // Make an edge

            let name1 = corner.name + conCorner.name;
            let name2 = conCorner.name + corner.name;



            // Get the cells that this edge shares
            let c1Cells = corner.cells;
            let c2Cells = conCorner.cells;
            let intersection = [...c1Cells].filter(x => c2Cells.has(x));

            if( (name1 in edgeMap) || (name2 in edgeMap) ) {
                // Try and add extra intersection cells to corner
                let edge = edgeMap[name1];
                edge.addCells(intersection);
            } else {
                let edge = new Edge(corner, connection.corner);
                edgeMap[name1] = edge;
                edgeMap[name2] = edge;
                edge.addCells(intersection);
                this.edges.push(edge);
            }
        }
        for(let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if(edge.cells.length >= 3) {
                edge.color = "#39ff14";
            } else {
                edge.color = "#f8234d";
            }
        }
    }
    console.log(" EDGE LENGTH: ", this.edges.length)
    this.makeFuzzyEdges();
}

// Should we make an edge between 2 corners?
shouldMakeEdge(corner1, corner2) {
    /*
    When should we make an edge?
    - Both corners must share the same 2 cells
    - The shared cells must be neighbours
    */
    let cells1 = corner1.cells;
    let cells2 = corner2.cells;




    console.log("Corner 1 has: ", cells1.size, " cells");
    console.log("Corner 2 has: ", cells2.size, " cells");

    // Could cells be a set and then we could test union?
    let intersection = new Set(
        [...cells1].filter(x => cells2.has(x))
    );
    // Temp
    cells1 = [...cells1];
    cells2 = [...cells2];
    this.tempCellDraw = this.tempCellDraw.concat(cells1, cells2)


    intersection = [...intersection];
    if(intersection.length >= 1) {
        console.log("Intersection has at least 2");
        // Now check if intersected cells are neighbours
        let makeEdge = true;
        // Foreach cell in intersection, all other cells must have this cell as a neighbour
        for(let i = 0; i < intersection.length; i++) {
            let intCell = intersection[i];
            for(let j = 0; j < intersection.length; j++) {
                if(j != i) {
                    let testCell = intersection[j];
                    let testNeighbors = testCell.neighbours;
                    // Test if int cell is in neigbours
                    if(! testNeighbors.includes(intCell) ){
                        // cells are not neighbours, should not make a cell.
                        makeEdge = false;
                    }
                }
            }
        }
        console.log("Tested intersection should we made edge: ", makeEdge);

        if(makeEdge) {
            return [corner1, corner2, intersection];
        }
    }

    return false;
}