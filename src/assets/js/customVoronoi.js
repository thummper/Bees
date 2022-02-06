const {Voronoi} = require('d3-delaunay');

export default class customVoronoi extends Voronoi {

    constructor(delaunay, [startX, startY, width, height]){
        super(delaunay, [startX, startY, width, height]);
        this.display = null;
        this.viewPadding = 100;
    }


    setDisplay(display){
        this.display = display;
    }

    render(context, display){

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

    getCells(numPoints){
        // For every point
        for(let i = 0; i < numPoints; i++){
            let cellPoints = super._clip(i);
        }
    }
    getCell(i){
        // Get cell for point i
        return super._clip(i);

    }

    // Render each cell in cells
    renderMap(cells, ctx) {
        for( let i = 0; i < cells.length; i++) {
            let cell = cells[i];
            this.drawCell(cell.cellPoints, ctx, cell.colour);
        }
    }
    // Render equator distance
    renderEquatorDistance(cells, ctx, gradient) {
        for( let i = 0; i < cells.length; i ++) {
            let cell = cells[i];
            let index = Math.round(cell.equatorDistance);
            this.drawCell(cell.cellPoints, ctx, gradient[index].hex);
            ctx.font = "128px Calibri";
            ctx.strokeText( Math.round(cell.equatorDistance).toString(), cell.x, cell.y);
        }
    }

    renderMoistureMap(cells, ctx, gradient) {
        for(let i in cells) {
            let cell = cells[i];
            let index = Math.round(cell.moisture);
            this.drawCell(cell.cellPoints, ctx, gradient[index].hex);
        }
    }

    renderHeightMap(cells, ctx, gradient) {
        for(let i in cells) {
            let cell = cells[i];
            let index = Math.round(cell.height);
            this.drawCell(cell.cellPoints, ctx, gradient[index].hex);
        }
    }


    drawCell(points, ctx, fill = "black"){

        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        let n = points.length;
        while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
        for (let i = 2; i < n; i += 2) {
          if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
          ctx.lineTo(points[i], points[i + 1]);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

    }

}