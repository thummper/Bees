
import '../sass/style.scss';
import canvasHandler from './canvasHandler';
import Map from './map';
import InputHandler from "./inputHandler";



let map    = document.querySelector('#mapContainer');
let canvas = map.querySelector("#mapDiagram");
let canvasManager = new canvasHandler(map, canvas);


var mapOptions = {
    'seed': 42,
    'x': -5000,
    'y': -5000,
    'width': 10000,
    'height': 10000,
    'numPoints': 2000
}
let testMap = new Map(mapOptions);
canvasManager.attachMap(testMap);

let inputHandler  = new InputHandler(canvasManager);


// Get debug panel
let debugPanel = document.querySelector(".debugContainer");
inputHandler.attachDebug(debugPanel);



// let lloydbutton = document.getElementById("lloydrelax");
// console.log("LLOYD: ", lloydbutton);
// lloydbutton.addEventListener("click", function(){
//     console.log("Trying lloyd relaxation");
//     if(testMap.voronoi != null){
//         testMap.lloydRelaxation();
//     }

// })

