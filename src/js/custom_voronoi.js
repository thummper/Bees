

const {Delaunay, Voronoi} = require('d3-delaunay');

export default class customVoronoi extends Voronoi {

    constructor(delaunay, [startX, startY, width, height]){

        super(delaunay, [startX, startY, width, height]);
        this.display = null;
        this.viewPadding = 100;
    }

    render(context, display){
        this.display = display;
        super.render(context);
    }

    _renderSegment(x0, t0, x1, y1, context){
        if( !this.outOfRange(x0) && !this.outOfRange(x1) ) {
            super._renderSegment(x0, t0, x1, y1, context);
        }
    }

    outOfRange(val){
        return val + this.viewPadding < this.display.x || val - this.viewPadding > ( this.display.x + this.display.width)
    }
}