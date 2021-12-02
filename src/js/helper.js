var seedrandom = require('seedrandom');


const randomgen = seedrandom("beans");
export default function randomNumber(min, max){
    let r = randomgen() * (max - min) + min;
    return r
}