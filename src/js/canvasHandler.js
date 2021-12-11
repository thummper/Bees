// import { tychei } from "seedrandom";
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
        this.minZoom = 0.1;
        this.maxZoom = 5;
        this.trackedMousePos = null;

        this.closestPont = null;

        this.view = {
            x: 0,
            y: 0,
            zoom: 1
        };
        this.viewPos = {
            prevX: null,
            prevY: null,
            dragging: false
        };

        this.map;
        // Call functions
        // Make sure canvas is the correct size
        this.windowResize();
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
    }

    getClosestCenter(location){
        // Location is the global coord of mouse click, assuming that (0,0) is translated to center?
        // So clientWidth/2, clientHeight/2
        let points      = this.map.points;
        let lowestDist  = Infinity;

        for (let p in points) {
            let [x, y] = points[p];
            let dist = Math.sqrt( Math.pow( x - location.x, 2) + Math.pow( y - location.y, 2));
            if( dist < lowestDist ){
                lowestDist = dist
                this.closestPont = points[p];
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
        console.log("Global: ", glob);
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

        this.view.zoom += zoom;

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
        this.ctx.restore();
        requestAnimationFrame(this.draw.bind(this));
    }

    // Draw map
    drawMap() {
        if(this.map != null) {
            // Clear map

            this.ctx.clearRect(-this.view.x / this.view.zoom, -this.view.y / this.view.zoom, this.canvas.width / this.view.zoom, this.canvas.height / this.view.zoom);
            // Draw edges
            this.ctx.beginPath();
            // TODO: custom draw function
            //

            let display = {
                x: - this.view.x / this.view.zoom,
                y:  - this.view.y / this.view.zoom,
                width: this.canvas.width / this.view.zoom,
                height: this.canvas.height / this.view.zoom
            };

            this.map.voronoi.render(this.ctx, display);


            //this.renderMap();
            //this.renderHull();
            this.ctx.stroke();

            // Draw centers.
            let points = this.map.points;

            for( let p in points ) {
                let [x, y] = points[p];
                this.ctx.beginPath();
                // TODO: DEBUG, also draw point coords to help me
                if( points[p] == this.closestPont){
                    this.ctx.fillStyle = "orange";
                } else {
                    this.ctx.fillStyle = "#8367C7";
                }
                this.ctx.strokeText(( Math.floor(x) + " " + Math.floor(y)), x + 2, y - 12);
                this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }


    // Drawing functions from D3
    renderMap(){
        // Previously rewrote the wrong function..
        let voronoi = this.map.voronoi;
        const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = voronoi;

        if (hull.length <= 1) return null;

        for(let i = 0; i < halfedges.length; ++i){
            let j = halfedges[i];
            if(j > i) continue;

            let ti = Math.floor(i/3) * 2;
            let tj = Math.floor(i/3) * 2;

            let xi = circumcenters[ti];
            let yi = circumcenters[ti + 1];

            let xj = circumcenters[tj];
            let yj = circumcenters[tj + 1];



            console.log(xi, yi)




        }









        // console.log(this.map);
        // const {points, halfedges, triangles} = this.map.delaunay;
        // for(let i = 0, n = halfedges.length; i < n; ++i) {
        //     let j = halfedges[i];

        //     if (j < i) continue;
        //     const ti = triangles[i] * 2;
        //     const tj = triangles[j] * 2;

        //     this.ctx.moveTo(points[ti], points[ti + 1]);
        //     this.ctx.lineTo(points[tj], points[tj + 1]);

        // }
        // this.renderHull();
    }


    // Draws the outline of the map
    renderHull(){
        let {hull, points} = this.map.delaunay;

        let h = hull[0] * 2, n = hull.length;
        this.ctx.moveTo(points[h], points[h + 1]);
        for ( let i = 1; i < n; i++ ) {
            let h = 2 * hull[i];
            this.ctx.lineTo( points[h], points[h + 1]);
        }
        this.ctx.closePath();
    }
}
