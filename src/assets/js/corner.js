const randomColour = require('randomcolor');

export default class Corner {
    constructor(xpos, ypos) {
        this.x = xpos;
        this.y = ypos;
        this.name = xpos.toString() + ypos.toString()
        // Store corner connections
        this.connections = [];
        // Cells that own this corner
        this.cells       = new Set();
        // TODO: Altitude, rivers.
        // Terrain information
        this.height = null;
    }

    addConnection(corner) {
        if(!this.connections.includes(corner)) {
            this.connections.push( {"corner": corner, "colour": randomColour({ hue: 'purple'})});
        }
    }
    addCell(cell) {

        if(!this.cells.has(cell)) {
            this.cells.add(cell);

        }


    }
}