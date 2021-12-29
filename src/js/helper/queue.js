export default class Queue {
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