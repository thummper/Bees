class Queue {
    constructor(elements = []) {
        this.elements = elements;
    }
    queue(item) {
        // Add item to queue
        this.elements.push(item);
    }
    dequeue(item) {
        // REmove first element?
        return this.elements.shift();
    }
    isEmpty() {
        return this.elements.length == 0;
    }
    length() {
        return this.elements.length;
    }
    // Add more than one element
    addElements(elements) {
        this.elements = this.elements.concat(elements);
    }
}

class Bounding {
    constructor(x, y, maxX, maxY){
        this.x  = x;
        this.y  = y;
        this.yb = maxY;
        this.xr = maxX;
    }
}

// Given a point and bounding box, find distance to closest edge of bounding
function edgeDistance(x, y, bounding) {
    // Doesnt work with my minuses
    let dist    = Infinity;
    let topD    = Math.abs(y - bounding.y);
    let bottomD = Math.abs(bounding.yb - y);
    let rightD  = Math.abs(bounding.xr - x);
    let leftD   = Math.abs(x - bounding.x);
    let cmp = [topD, bottomD, leftD, rightD];
    for(let val of cmp) {
        if(val < dist) {
            dist = val;
        }
    }
    return dist
}

// Array information
function maxMinAvg(arr) {
    var max = arr[0];
    var min = arr[0];
    var sum = arr[0]; //changed from original post
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
        if (arr[i] < min) {
            min = arr[i];
        }
        sum = sum + arr[i];
    }
    return [max, min, sum/arr.length];

}

module.exports = {
    Queue,
    Bounding,
    edgeDistance,
    maxMinAvg
}