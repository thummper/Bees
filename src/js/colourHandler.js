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
        let end = "#e3622f";
        let start   = "#c6ecde";
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
            this.baseColours['ocean']    = '#0B132B';
            //this.baseColours['ocean'] = 'black';
            this.baseColours['water']    = '#497786';
            this.baseColours['land']     = '#d3db95';
            // this.baseColours['mountain'] = '#eee7de';

            this.baseColours['tundra'] = "#eee7de";
            this.baseColours['boreal'] = "#5B8F52";
            this.baseColours['grassland'] = "#927E30";
            this.baseColours['woodland'] = "#B37C06";
            this.baseColours['forest'] = "#2C89A0";
            this.baseColours['rainforest'] = "#0A546D";
            this.baseColours['desert'] = "#C87137";
            this.baseColours['savannah'] = "#97A527";
            this.baseColours['tropical_rainforest'] = "#075330";



        }
    }

    // Given a cell, set its colour
    setColour(cell) {
        // console.log( this.baseColours[cell.biome]);
        cell.colour = this.baseColours[cell.biome];
    }
}