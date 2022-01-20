// Handle biome colours, not sure if should be a class but map class is getting a bit big.
const randomColour = require('randomcolor');
const nanoColour   = require('nanocolor-hsl');


export default class ColourHandler {
    constructor() {
        this.baseColours = {};
        this.setBiomeColours();
        this.generateHeatMap();
        this.generateMoistureMap();
    }

    generateHeatMap() {
        let start = "#e3622f";
        let end   = "#c6ecde";
        this.equatorGradient = nanoColour.gradient(start, end, 101);
    }

    generateMoistureMap() {
        let start = "#406a88";
        let end   = "#f9f2cf";
        this.moistureGradient = nanoColour.gradient(start, end, 101);
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