var seedrandom = require('seedrandom');
const randomgen = seedrandom();
function randomNumber(min, max){
    let r = randomgen() * (max - min) + min;
    return r
}

function perpendicularDistance(point, line) {
    let x1 = point.x;
    let y1 = point.y;
    let a  = -line.m;
    let b  = 1;
    let c  = -line.c;

    let d = Math.abs(a * x1 + b * y1 + c) / Math.sqrt( a**2 + b**2 );
    return d;

}


module.exports = {randomNumber, perpendicularDistance};
