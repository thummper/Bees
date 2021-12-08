
import '../sass/style.scss';
import randomNumber from './helper.js';
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
    'numPoints': 4000
}
let testMap = new Map(mapOptions);
canvasManager.attachMap(testMap);

