
import '../sass/style.scss';
import randomNumber from './helper.js';
import canvasHandler from './canvasHandler';
import Map from './map';



let map    = document.querySelector('#mapContainer');
let canvas = map.querySelector("#mapDiagram");
let canvasManager = new canvasHandler(map, canvas);

var mapOptions = {
    'seed': 42,
    'x': -10000,
    'y': -10000,
    'width': 10000,
    'height': 10000,
    'numPoints': 2000
}
let testMap = new Map(mapOptions);

canvasManager.attachMap(testMap);






// function drawDiagram(){
//     ctx.fillStyle = "black";
//     ctx.beginPath();
//     delaunay.render(ctx);
//     ctx.stroke()
//     ctx.closePath();
// }





// window.addEventListener("resize", function(){
//     console.log("Window Resized");
//     updateContext();
// })









// function updateContext(){
//     ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
//     ctx.canvas.width  = canvas.clientWidth;
//     ctx.canvas.height = canvas.clientHeight;

//     if(delaunay != undefined){
//         drawDiagram();
//     }
// }





// function generateVoronoi(xMin, xMax, yMin, yMax, numberPoints){
//     // Given a bounding box, generate x points and then generate voronoi diagram
//     let points = [];
//     for(let i = 0; i < numberPoints; i++){
//         // Get x and y position within bounding box
//         let rX = randomNumber(xMin, xMax);
//         let rY = randomNumber(yMin, yMax);
//         let point = [rX, rY];
//         points.push(point);
//     }

//     delaunay = Delaunay.from(points);
//     voronoi  = delaunay.voronoi([xMin, yMin, xMax, yMax]);




//     updateContext();
//     drawDiagram();






//     // Now we have points, generate voronoi
//     // let voronoi  = new Voronoi();
//     // let bounding = {x1: xMin, xr: xMax, yt: yMin, yb: yMax};
//     // let diagram  = voronoi.compute(points, bounding);
//     // console.log("Generated Diagram - Not sure what this returns");
//     // console.log(diagram);


// }


// generateVoronoi(-1000, 1000, -1000, 1000, 500);


