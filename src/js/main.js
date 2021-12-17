
import '../sass/style.scss';
import canvasHandler from './canvasHandler';
import Map from './map';



let map    = document.querySelector('#mapContainer');
let canvas = map.querySelector("#mapDiagram");
let canvasManager = new canvasHandler(map, canvas);

var mapOptions = {
    'seed': 42,
    'x': -5000,
    'y': -5000,
    'width': 10000,
    'height': 10000,
    'numPoints': 10000
}
let testMap = new Map(mapOptions);
canvasManager.attachMap(testMap);


let lloydbutton = document.getElementById("lloydrelax");
console.log("LLOYD: ", lloydbutton);
lloydbutton.addEventListener("click", function(){
    console.log("Trying lloyd relaxation");
    if(testMap.voronoi != null){
        testMap.lloydRelaxation();
    }

})

