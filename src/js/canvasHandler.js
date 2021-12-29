// import { tychei } from "seedrandom";
const randomColour = require('randomcolor');
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
        this.minZoom = 0.05;
        this.maxZoom = 5;
        this.trackedMousePos = null;
        this.closestCell = null;

        this.trackedKey = null;
        this.keySens = 20;



        this.viewPos = {
            prevX: null,
            prevY: null,
            dragging: false
        };

        this.map = null;
        // Call functions
        // Make sure canvas is the correct size
        this.windowResize();
        this.view = {
            x: this.canvas.width / 2.5,
            y: this.canvas.height / 2.5,
            zoom: 0.05
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

    keyup(event) {
        console.log("key released");
    }

    // Track keypresses for keyboard navigation
    keydown(event) {
        let code = event.code;
        switch(code){
            case "KeyW":
                // Pan up
                this.moveView(0, -this.keySens);
                break;
            case "KeyS":
                // Pan down
                this.moveView(0, this.keySens);
                break;
            case "KeyA":
                // Pan left
                this.moveView(this.keySens, 0);
                break;
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

        this.getClosestCenter( this.getGlobalMousePosition(event) );

    }

    // Mouse is released
    pointerUp(event) {
        // Stop any current dragging actions
        this.viewPos.dragging = false;
        this.viewPos.prevX    = null;
        this.viewPos.prevY    = null;
    }

    // Mouse is moved
    pointerMove(event) {
        if(this.viewPos.dragging) {
            // Track the distance we have moved from the starting position
            let {prevX, prevY, dragging} = this.viewPos;
            let pos = this.getMousePosition(event);
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
        let zoom = 1 * val * this.zoomSensitivity;
        let wx = (this.canvas.width / 2) / (this.canvas.width * this.view.zoom);
        let wy = (this.canvas.height / 2) / (this.canvas.height * this.view.zoom);

        this.view.x -= wx * this.canvas.width * zoom;
        this.view.y -= wy * this.canvas.height * zoom;

        this.adjustZoom(zoom);

    }


    // Mouse wheel
    mouseWheel(event) {
        let {x, y, deltaY} = event;
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
            let visibleCells = this.map.getCells(display);
            // Draw visible cells
            this.map.voronoi.renderMap(visibleCells, this.ctx);
            this.drawCenters(visibleCells);
            // this.map.voronoi.render(this.ctx, display);
        }
    }

    // In progress debug function
    drawDebug() {
        if(this.map != null) {
            let corners = this.map.cornerMap;
            for(let key in corners) {
                let corner = corners[key];
                if(corner.edge) {
                    this.ctx.fillStyle = "cyan";
                    this.drawCircle(corner.x, corner.y);

                }
            }
        }
    }


    drawCircle(x, y){
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawCenters(cells) {
        // Draw centers of all visible cells
        let closestVisible = false
        for(let i = 0; i < cells.length; i++) {
            let c = cells[i];
            let [x, y] = c.centerPoint;
            this.ctx.fillStyle = "orange";
            // If current cell is focused, draw it's corners and highlight the center
            if(this.closestCell != null && this.closestCell == c) {
                closestVisible = true;
            }
            this.drawCircle(x, y);
        }
        // Not sure if I like this check
        if(closestVisible) {
            this.drawFocused();
        }
    }

    // Debug drawing for currently focused cell.
    drawFocused() {
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
