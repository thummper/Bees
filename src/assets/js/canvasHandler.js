// Canvas handler handles panning, zooming and drawing to the canvas
export default class canvasHandler {

    constructor(container, canvas) {
        // The canvas wrapper and canvas are passed.
        this.container = container;
        this.canvas    = canvas;
        this.ctx       = this.canvas.getContext("2d");

        // Panning and zooming vars
        this.dragging = false;
        this.zoomSensitivity = 0.05;
        this.minZoom = 0.01;
        this.maxZoom = 5;
        this.trackedMousePos = null;
        this.closestCell = null;

        this.trackedKey = null;
        this.keySens = 40;

        // Maintain visible cells.
        this.visibleCells = null;



        this.viewPos = {
            prevX: null,
            prevY: null,
            dragging: false
        };

        this.debugSettings = {
            'drawEquator': false,
            'drawCenter': false,
            'equatorDistance': false,
            'drawCellCenters': false,
            'drawFocusedInfo': true,
            'renderMoisture': false,
            'renderHeight': false,
        }

        this.map = null;
        // Call functions
        // Make sure canvas is the correct size
        this.windowResize();
        this.view = {
            x: this.canvas.width / 2.5,
            y: this.canvas.height / 2.5,
            zoom: 1
        };
        // Register important event listeners
        this.registerListeners();
        // Start drawing loop.
        this.draw();
    }

    registerListeners() {
        window.addEventListener("resize", this.windowResize.bind(this));
        // Register listeners for panning and zooming.
        this.canvas.addEventListener('mousedown', this.pointerDown.bind(this));
        this.canvas.addEventListener('mouseup', this.pointerUp.bind(this));
        this.canvas.addEventListener('mousemove', this.pointerMove.bind(this));
        this.canvas.addEventListener('wheel', this.mouseWheel.bind(this));
        document.addEventListener('keydown', this.keydown.bind(this));
        document.addEventListener('keyup', this.keyup.bind(this));
    }

    keyup() {
        console.log("key released");
    }

    // Track keypresses for keyboard navigation
    keydown(event) {
        let code = event.code;
        switch(code){
            case "ArrowUp":
            case "KeyW":
                // Pan up
                this.moveView(0, -this.keySens);
                break;
            case "ArrowDown":
            case "KeyS":
                // Pan down
                this.moveView(0, this.keySens);
                break;
            case "ArrowLeft":
            case "KeyA":
                // Pan left
                this.moveView(this.keySens, 0);
                break;
            case "ArrowRight":
            case "KeyD":
                // Pan right
                this.moveView(-this.keySens, 0);
                break;
            case "Equal":
                // Zoom in
                this.keyWheel(this.keySens / 100);
                break;
            case "Minus":
                // Zoom out
                this.keyWheel(-this.keySens / 100);
        }
    }

    moveView(x, y) {
        this.view.x += x;
        this.view.y -= y;
    }

    getClosestCenter(location) {
        // Loop through map cells instead of points so we can get the whole cell
        let lowestDist   = Infinity;
        this.closestCell = null;
        let cells        = this.map.cells;
        if(cells.length != null){
            for(let i = 0; i < cells.length; i++){
                let cell = cells[i];
                let cellCenter = cell.centerPoint;
                let dist = Math.sqrt( Math.pow(cellCenter[0] - location.x, 2) + Math.pow( cellCenter[1] - location.y, 2));
                if(dist < lowestDist){
                    lowestDist = dist;
                    this.closestCell = cell;
                }
            }
        }
    }

    getGlobalMousePosition(event){
        // Get local mouse
        let loc  = this.getMousePosition(event);
        // Inverse translation matrix?
        // Undo the translation and then the scale
        let glob = {
            x: (loc.x - this.view.x) / this.view.zoom,
            y: (loc.y - this.view.y) / this.view.zoom,
        }
        return glob;
    }

    getMousePosition(event){
        // Canvas may not be at window (0, 0)
        // Get bounding rect.
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }

    // Mouse button is pressed
    pointerDown(event) {
        // Pointer pressed - start drag action
        console.log(" Pointer down pressed");
        this.viewPos.dragging = true;
        // Record start of drag
        let pos = this.getMousePosition(event);
        this.viewPos.prevX = pos.x;
        this.viewPos.prevY = pos.y;
        console.log(this.getGlobalMousePosition(event));
        this.getClosestCenter( this.getGlobalMousePosition(event) );
    }

    // Mouse is released
    pointerUp() {
        // Stop any current dragging actions
        this.viewPos.dragging = false;
        this.viewPos.prevX    = null;
        this.viewPos.prevY    = null;
    }

    // Mouse is moved
    pointerMove(event) {
        let pos = this.getMousePosition(event);
        this.trackedMousePos = pos;
        if(this.viewPos.dragging) {
            // Track the distance we have moved from the starting position
            let {prevX, prevY} = this.viewPos;

            let dx  = pos.x - prevX;
            let dy  = pos.y - prevY;
            if( prevX || prevY ) {
                this.view.x += dx;
                this.view.y += dy;
                this.viewPos.prevX = pos.x;
                this.viewPos.prevY = pos.y;
            }
        }
    }

    adjustZoom(zoom) {
        this.view.zoom += zoom;
        this.view.zoom = Math.max(this.minZoom, this.view.zoom);
        this.view.zoom = Math.min(this.maxZoom, this.view.zoom);
    }

    keyWheel(val){
        val = val / (this.view.zoom * 2);



        let zoom = 1 * val * this.zoomSensitivity;

        let pos = {x: this.canvas.width/2, y: this.canvas.height/2};
        if(this.trackedMousePos != null){
            pos = this.trackedMousePos
        }
        let wx = (pos.x - this.view.x) / (this.canvas.width * this.view.zoom);
        let wy = (pos.y - this.view.y) / (this.canvas.height * this.view.zoom);

        this.view.x -= wx * this.canvas.width * zoom;
        this.view.y -= wy * this.canvas.height * zoom;

        this.adjustZoom(zoom);

    }


    // Mouse wheel
    mouseWheel(event) {
        let {deltaY} = event;
        let dir  = deltaY > 0 ? -1 : 1;
        let zoom = 1 * dir * this.zoomSensitivity;
        let pos = this.getMousePosition(event);
        let wx  = ( pos.x - this.view.x ) / ( this.canvas.width * this.view.zoom );
        let wy  = ( pos.y - this.view.y ) / ( this.canvas.height * this.view.zoom );
        this.view.x -= wx * this.canvas.width * zoom;
        this.view.y -= wy * this.canvas.height * zoom;
        this.adjustZoom(zoom);

    }

    // Call this to make sure client canvas size matches context, changes when the window resizes (canvas uses % vals for w/h)
    windowResize() {
        this.ctx.canvas.width  = this.canvas.clientWidth;
        this.ctx.canvas.height = this.canvas.clientHeight;
    }

    // Replace map with local map
    attachMap(map) {
        // Extra logic, not sure if we will do something on first instance?
        if(this.map == null) {
            console.log("First time map has been attached. ");
            this.map = map;
            console.log("Map: ", map);
        } else {
            console.log("Map is being replaced. ");
            this.map = map;
        }

    }

    // Handle panning, scaling and drawing to canvas
    draw() {
        // Handle translation, panning and drawing to canvas
        this.ctx.save();
        this.ctx.translate(this.view.x, this.view.y);
        this.ctx.scale(this.view.zoom, this.view.zoom);
        this.drawMap();
        this.drawDebug();
        this.ctx.restore();
        requestAnimationFrame(this.draw.bind(this));
    }

    drawLine(start, end, width = 4, color = false) {
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.lineWidth = width;
    }


    // Draw map
    drawMap() {
        if(this.map != null) {
            // Clear map
            this.ctx.clearRect(-this.view.x / this.view.zoom, -this.view.y / this.view.zoom, this.canvas.width / this.view.zoom, this.canvas.height / this.view.zoom);
            let display = {
                x: - this.view.x / this.view.zoom,
                y:  - this.view.y / this.view.zoom,
                width: this.canvas.width / this.view.zoom,
                height: this.canvas.height / this.view.zoom
            };
            // Tell the map where the camera is


            this.map.voronoi.setDisplay(display);
            // Get visible cells
            this.visibleCells = this.map.getCells(display);
            // this.visibleCells = this.map.tempCellDraw;
            // Draw visible cells
            this.map.voronoi.renderMap(this.visibleCells, this.ctx);
            //this.map.voronoi.render(this.ctx, display);

            // Temp - draw edges
            // console.log("Drawing ", this.visibleCells.length, " cells");
            // for(let i = 0; i < this.visibleCells.length; i++) {
            //     let cell = this.visibleCells[i];
            //     this.drawEdges(cell.edges)
            // }
            // this.ctx.lineWidth = 4;
            // let edges = [];
            // for(let i = 0; i < this.visibleCells.length; i++) {
            //     let cell = this.visibleCells[i];
            //     let cellEdges = cell.edges;
            //     for(let j = 0; j < cellEdges.length; j++) {
            //         let edge = cellEdges[j];
            //         edges.push(edge);
            //     }
            // }
            // for(let i = 0; i < edges.length; i++) {
            //     this.drawEdges(edges[i]);
            // }
            // this.ctx.stroke();

        }
    }

    drawEdges(edge) {
        let start  = edge.start;
        let end    = edge.end;
        let points = edge.points;


        this.ctx.moveTo(start.x, start.y);

        for(let i = 0; i < points.length; i++) {
            let edgePoint = points[i];
            this.ctx.lineTo(edgePoint.x, edgePoint.y);

        }
        this.ctx.lineTo(end.x, end.y);



    }

    // In progress debug function
    drawDebug() {
        if(this.map != null) {

            // Draw cell centers
            if(this.debugSettings['drawCellCenters']) {
                this.drawCenters(this.visibleCells);
            }

            // Draw focused cell information
            if(this.debugSettings['drawFocusedInfo']) {
                this.drawFocused();
            }

            // Draw equator
            if(this.debugSettings['drawEquator']) {
                this.drawLine(this.map.equator['start'], this.map.equator['end']);
            }

            if(this.debugSettings['equatorDistance']) {
                this.map.voronoi.renderEquatorDistance(this.visibleCells, this.ctx, this.map.colourHandler.equatorGradient);
            }

            if(this.debugSettings['renderMoisture']) {
                this.map.voronoi.renderMoistureMap(this.visibleCells, this.ctx, this.map.colourHandler.moistureGradient);
            }

            if(this.debugSettings['renderHeight']) {
                this.map.voronoi.renderHeightMap(this.visibleCells, this.ctx, this.map.colourHandler.heightGradient);
            }




            let corners = this.map.cornerMap;
            for(let key in corners) {
                let corner = corners[key];
                if(corner.edge) {
                    this.ctx.fillStyle = "cyan";
                    this.drawCircle(corner.x, corner.y);

                }
            }

            if(this.debugSettings['drawCenter']) {
                this.drawCircle(this.map.center.x, this.map.center.y, 50);
                this.drawCircle(this.map.startX, this.map.startY, 100);
                this.drawCircle(this.map.width, this.map.height, 100);
            }
        }



    }


    drawCircle(x, y, r = 10){
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawCenters(cells) {
        // Draw centers of all visible cells

        for(let i = 0; i < cells.length; i++) {
            let c = cells[i];
            let [x, y] = c.centerPoint;
            this.ctx.fillStyle = "orange";
            this.drawCircle(x, y);
        }
    }

    // Debug drawing for currently focused cell.
    drawFocused() {
        if(this.closestCell != null) {
            // Currently this just draws over previous stuff
            let cell = this.closestCell;
            // Draw cell center
            this.ctx.fillStyle = "pink";
            this.drawCircle(cell.centerPoint[0], cell.centerPoint[1]);

            // this.ctx.strokeText(cell.height.toString(), cell.centerPoint[0], cell.centerPoint[1]);

            // Also draw corners
            this.ctx.fillStyle = "red";
            let corners = cell.corners;
            for(let i in corners) {
                let corner = corners[i];
                this.drawCircle(corner.x, corner.y);
            }
            // Draw connections between corners
            for(let i in corners) {
                let corner = corners[i];
                let cornerConnections = corner.connections;
                if(cornerConnections.length > 0){
                    this.drawCornerConnections(corner, cornerConnections);
                    this.drawCornerHeight(corner);
                }
            }
            // Also draw neighbours of cell
            this.ctx.fillStyle = "black";
            let neighbours = cell.neighbours;
            for(let n in neighbours) {
                let neighbour = neighbours[n];
                this.drawCircle(neighbour.centerPoint[0], neighbour.centerPoint[1]);
            }
        }
    }

    //Stroke text for corner height
    drawCornerHeight(corner) {
        // this.ctx.strokeText( corner.height.toString(), corner.x, corner.y);
    }

    // Draw corner connections
    drawCornerConnections(corner, cornerConnections) {
        for(let i = 0; i < cornerConnections.length; i++) {
            let connection = cornerConnections[i];
            let conCorner  = connection['corner'];
            let colour     = connection['colour'];
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(corner.x, corner.y);
            this.ctx.lineTo(conCorner.x, conCorner.y);
            this.ctx.closePath();
            // Random colour for each corner
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = colour;
            this.ctx.stroke();
            this.ctx.restore();

        }

    }
}
