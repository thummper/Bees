var seedrandom = require('seedrandom');

const randomgen = seedrandom();
export default function randomNumber(min, max){
    let r = randomgen() * (max - min) + min;
    return r
}