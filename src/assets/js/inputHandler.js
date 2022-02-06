// This class should handle basic UI?

export default class InputHandler {

    constructor(canvasHandler) {
        // Needs reference to canvas handler to change debug drawing information
        this.canvasHandler = canvasHandler;
        console.log("CANVAS HANDLER: ", canvasHandler.debugSettings)
        // Undefined at construction
        this.debugPanel;
    }

    attachDebug(debugPanel) {
        this.debugPanel = debugPanel;
        let debugForm   = this.debugPanel.querySelector("form");
        // Get all inputs on form?
        let inputs      = debugForm.querySelectorAll("input");
        console.log("FORM: ", debugForm, " INPUTS: ", inputs);

        for(let i of inputs) {
            console.log("TYPE: ", i.type)
            if(i.type == "checkbox") {
                i.addEventListener('change', function(){
                    // Input has been changed, update debug information
                    let id = i.id;
                    this.canvasHandler.debugSettings[id] = i.checked;
                    console.log("New value: ", i.checked);
                }.bind(this));
            }

        }
    }
}