// Handle biome colours, not sure if should be a class but map class is getting a bit big.

export default class ColourHandler {
    constructor() {
        this.baseColours = {};
        this.setBiomeColours();
    }
    setBiomeColours(biomeColours = null) {
        if(biomeColours == null) {
            // Generate yourself (default behaviour)
            // We need to generate a colour for each biome type
            // #497786
            this.baseColours['ocean'] = '#0B132B';
            //this.baseColours['ocean'] = 'black';
            this.baseColours['water'] = '#497786';
            this.baseColours['land']  = '#d3db95';
            this.baseColours['mountain'] = '#eee7de';
        }
    }

    // Given a cell, set its colour
    setColour(cell) {
        // console.log( this.baseColours[cell.biome]);
        cell.colour = this.baseColours[cell.biome];
    }
}