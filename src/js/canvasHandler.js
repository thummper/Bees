// import { tychei } from "seedrandom";

// function drawRect(ctx, x, y, width, height){
//     ctx.fillRect(x, y, width, height);
// };



// Canvas handler handles panning, zooming and drawing to the canvas
export default class canvasHandler {

    constructor(container, canvas) {
        // The canvas wrapper and canvas are passed.
        this.container = container;
        this.canvas    = canvas;
        this.ctx       = this.canvas.getContext("2d");

        // Panning and zooming vars
        this.dragging = false;

        this.absPos = {
            scale: 1,
            offset: {
                x: 0,
                y: 0
            }
        }

        this.pan = {
            start: {
                x: null,
                y: null
            },
            offset: {
                x: 0,
                y: 0,
            }
        }

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

    getGlobalMousePosition(event){
        // Get local mouse
        let loc  = this.getMousePosition(event);
        let glob = {
            x: loc.x - this.absPos.offset.x,
            y: loc.y - this.absPos.offset.y,
        }
        console.log("Global: ", glob);

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
        this.dragging = true;
        // Get current mouse position
        this.pan.start = this.getMousePosition(event);

        // Also get current mouse pos as global coords.
        this.getGlobalMousePosition(event);

    }

    // Mouse is moved
    pointerMove(event) {
        // Only really care if mouse is moved when we are dragging.
        if(this.dragging) {
            // Logic for panning, track panning offset
            // Get current mouse position
            let currentPos = this.getMousePosition(event);
            // Work out offset from start.
            let offset = {
                x: currentPos.x - this.pan.start.x,
                y: currentPos.y - this.pan.start.y
            };

            this.pan.offset.x = this.absPos.offset.x + offset.x;
            this.pan.offset.y = this.absPos.offset.y + offset.y;


            console.log("Panning offset: ", this.pan.offset )
        }
    }

    // Mouse is released
    pointerUp(e) {
        // Stop dragging
        this.dragging = false;
        this.pan.start.x = null;
        this.pan.start.y = null;

        this.absPos.offset.x = this.pan.offset.x;
        this.absPos.offset.y = this.pan.offset.y;


    }

    // Mouse wheel
    mouseWheel(event) {

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
        // Make sure canvas is correct size
        this.windowResize();
        this.ctx.translate(this.pan.offset.x, this.pan.offset.y);
        this.drawMap();
        requestAnimationFrame(this.draw.bind(this));
    }

    // Draw map
    drawMap() {

        if(this.map != null) {
            // Clear map
            this.ctx.clearRect(this.map.startX, this.map.startY, this.map.width, this.map.height);
            // Draw edges
            this.ctx.beginPath();
            this.map.voronoi.render(this.ctx);
            this.ctx.stroke();

            // Draw centers.
            let points = this.map.points;
            this.ctx.fillStyle = "#8367C7";
            for( let p in points ) {
                let [x, y] = points[p];
                this.ctx.beginPath();
                // TODO: DEBUG, also draw point coords to help me
                this.ctx.strokeText(( Math.floor(x) + " " + Math.floor(y)), x + 2, y - 12);
                this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }


}



// export default class canvasHandler {
//     constructor(container, canvas) {
//         this.container = container;
//         this.canvas    = canvas;
//         this.ctx       = this.canvas.getContext("2d");
//         this.map;
//         this.registerListeners();
//         this.windowResize();

//         this.cameraZoom = 1;
//         this.maxZoom    = 5;
//         this.minZoom    = 0.1;
//         this.scrollSensitivity = 0.0005;


//         // Camera offset is camera position essentially
//         this.cameraOffset = {
//             x: this.canvas.clientWidth / 2,
//             y: this.canvas.clientHeight / 2
//         }


//         this.isDragging = false;


//         this.dragInfo    = {x: null, y: null}
//         this.lastZoom    = null;
//         this.closestPont = null;

//         this.draw();
//     }

//     windowResize(){
//         console.log(" Window Resized ");
//         // Canvas resize magic.
//         this.ctx.canvas.width  = this.canvas.clientWidth;
//         this.ctx.canvas.height = this.canvas.clientHeight;
//         if(this.map != null){
//             // We have an attached map, draw it.
//             this.updateCanvas();
//         }
//     }



//     getEventLocation(event){
//         // Bounding rect gives x y offset from 0,0 of window (canvas is not at global 0,0), then we translate client coords
//         let rect = this.canvas.getBoundingClientRect();
//         return {
//             x: event.clientX - rect.left,
//             y: event.clientY - rect.top
//         }
//     }

//     getClosestCenter(location){
//         // Location is the global coord of mouse click, assuming that (0,0) is translated to center?
//         // So clientWidth/2, clientHeight/2



//         let points      = this.map.points;
//         let lowestDist  = Infinity;

//         for (let p in points) {
//             let [x, y] = points[p];
//             // Translate so (0,0) is correct?
//             //x += this.canvas.clientWidth  / 2;
//             //y += this.canvas.clientHeight / 2;

//             let dist = Math.sqrt( Math.pow( x - location.x, 2) + Math.pow( y - location.y, 2));
//             if( dist < lowestDist ){
//                 lowestDist = dist
//                 this.closestPont = points[p];
//             }
//         }


//         // // Mouse local coords need to go to global?
//         // let trans = {
//         //     x: (eventLoc.x - this.cameraOffset.x) / this.cameraZoom,
//         //     y: (eventLoc.y - this.cameraOffset.y) / this.cameraZoom
//         // }

//         // for(let p in points){
//         //     // For each point calc distance.
//         //     let [x, y] = points[p];
//         //     let dist = Math.sqrt( Math.pow((x - trans.x), 2) + Math.pow((y - trans.y), 2) );
//         //     //console.log(dist)
//         //     // TODO: Not this loop please.
//         //     if(dist < lowestDist){
//         //         lowestDist  = dist;
//         //         this.closestPont = points[p];

//         //     }
//         // }

//         // console.log("Mouse: ", trans)
//         // console.log("CLOSEST POINT: ", this.closestPont);
//         // //console.log("LOWEST: ", lowestDist);

//     }




//     pointerDown(event) {
//         let location    = this.getEventLocation(event);
//         this.isDragging = true;
//         // Record the start of the drag
//         // location.x/y is relative to (0,0) of canvas, need it to be relative to the point we are translating about
//         this.dragInfo.x = (location.x - this.cameraOffset.x) / this.cameraZoom;
//         this.dragInfo.y = (location.y - this.cameraOffset.y) / this.cameraZoom;
//         let globalLocation = {
//             x: (location.x - this.cameraOffset.x) / this.cameraZoom,
//             y: (location.y - this.cameraOffset.y) / this.cameraZoom
//         };
//         console.log("Global Loc: ", globalLocation);
//         console.log("Camera Off: ", this.cameraOffset);
//         console.log(this.ctx.getTransform())
//         this.getClosestCenter(globalLocation);
//         // this.dragInfo.x = eventLoc.x / this.cameraZoom - this.cameraOffset.x;
//         // this.dragInfo.y = eventLoc.y / this.cameraZoom- this.cameraOffset.y;
//     }

//     pointerUp(event){
//         this.isDragging = false;
//         this.lastZoom   = this.cameraZoom;
//     }

//     pointerMove(event) {

//         // Get location of pointer
//         let location = this.getEventLocation(event);


//         // Update camera offset
//         if(this.isDragging) {
//             // Update position of camera
//             this.cameraOffset.x = (location.x - this.dragInfo.x) / this.cameraZoom;
//             this.cameraOffset.y = (location.y - this.dragInfo.y) / this.cameraZoom;

//         }



//         // let ec = this.getEventLocation(event);
//         // console.log("Screen Coords: ", ec)

//         // let offx = this.cameraOffset.x
//         // let offy = this.cameraOffset.y

//         // let tx = {
//         //     x: ec.x - (offx / this.cameraZoom),
//         //     y: ec.y - (offy / this.cameraZoom)
//         // }
//         // console.log("Transformed Coords: ", tx)




//         // if(this.isDragging){
//         //     let eventLoc = this.getEventLocation(event);
//         //     this.cameraOffset.x = eventLoc.x / this.cameraZoom - this.dragInfo.x;
//         //     this.cameraOffset.y = eventLoc.y / this.cameraZoom - this.dragInfo.y;
//         // }

//     }

//     adjustZoom(event, factor){

//         let adjust = -event.deltaY * this.scrollSensitivity;
//         if(!this.isDragging){
//             this.cameraZoom += adjust;
//             this.cameraZoom = Math.min( this.cameraZoom, this.maxZoom);
//             this.cameraZoom = Math.max( this.cameraZoom, this.minZoom);
//         }
//         console.log("Zoom: ", this.cameraZoom)


//     }


//     registerListeners(){
//         this.canvas.addEventListener('mousedown', this.pointerDown.bind(this));
//         this.canvas.addEventListener('mouseup', this.pointerUp.bind(this));
//         this.canvas.addEventListener('mousemove', this.pointerMove.bind(this));
//         this.canvas.addEventListener('wheel', this.adjustZoom.bind(this))

//         window.addEventListener("resize", this.windowResize.bind(this));
//     }



//     draw(){
//         this.ctx.lineWidth = 3;
//         this.canvas.width  = this.canvas.clientWidth;
//         this.canvas.height = this.canvas.clientHeight;
//         // Translate to canvas center before zooming - you'll always zoom on what you're looking directly at.
//         this.ctx.translate( this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);
//         this.ctx.scale(this.cameraZoom, this.cameraZoom);
//         this.ctx.translate( -this.canvas.clientWidth / 2, -this.canvas.clientHeight / 2);



//         this.ctx.translate(this.cameraOffset.x, this.cameraOffset.y)
//         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//         this.updateCanvas()




//         requestAnimationFrame(this.draw.bind(this));

//     }


//     updateCanvas(){
//         // console.log(this.map.delaunay)
//         if(this.map != null){
//             this.ctx.beginPath();
//             this.map.voronoi.render(this.ctx);
//             this.ctx.stroke();

//             // Render points?
//             let points = this.map.points;


//             this.ctx.fillStyle = "#8367C7";
//             for(let p in points){
//                 let [x, y] = points[p];
//                 this.ctx.beginPath();
//                 this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
//                 this.ctx.fill();
//             }

//             this.ctx.fillStyle = "#FF8811";
//             if(this.closestPont != null){
//                 this.ctx.beginPath();
//                 this.ctx.arc(this.closestPont[0], this.closestPont[1], 30, 0, 2 * Math.PI);
//                 this.ctx.fill();
//             }

//             this.ctx.arc(0, 0, 10, 0, 2 * Math.PI);
//             this.ctx.fill();

//         }



//     }

//     attachMap(map){
//         // Attach a map to this canvas
//         if(this.map == null){
//             console.log(" Canvas has no map, attaching");
//             this.map = map;
//         } else {
//             console.log(" Canvas already has map, reattaching");
//             this.map = map;
//         }
//     }

// }