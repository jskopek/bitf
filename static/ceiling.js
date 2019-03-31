const EventEmitter = require( 'events' );
var Panel = require('./panel.js');

class Ceiling extends EventEmitter {
    constructor(canvas, rows, cols, size, gap) {
        super();
        this.canvas = canvas;
        this.rows = rows;
        this.cols = cols;
        this.size = size;
        this.gap = gap;
        this.panels = [];

        for(var row = 0; row < rows; row++) {
            var rowPanels = [];
            for(var col = 0; col < cols; col++) {
                var x = col * (this.size + this.gap);
                var y = row * (this.size + this.gap);
                var panel = new Panel(this.canvas, x, y, this.size - this.gap);
                rowPanels.push(panel);
            }
            this.panels.push(rowPanels);
        }
    }
    save() {
        var values = []
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                values.push(this.panels[row][col].save());
            }
        }
        return values;
    }
    render(values, playSpeed) {
        var i = 0;
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                var color = values[i];
                this.panels[row][col].setColor(color[0], color[1], color[2], color[3], playSpeed);
                i++;
            }
        }
        this.emit('render', values);
        // send to pusher
        //fetch('/push/?sequence=' + encodeURIComponent(JSON.stringify(values)));
    }
}

class ClickableCeiling extends Ceiling {
    getPanelAtCoords(x, y) {
        var col = Math.floor(x / (this.size + this.gap));
        var row = Math.floor(y / (this.size + this.gap));
        try {
            return this.panels[row][col];
        } catch {
            return false;
        }
    }
    constructor(canvas, rows, cols, size, gap, color, opacity) {
        super(canvas, rows, cols, size, gap);
        this.color = color || [40,180,105];
        this.opacity = opacity || 1;


        // function that modifies panel color based on touch location
        var setPanelColor = (canvasX, canvasY) => {
            if(!this.clickedPanels) { return; }

            var col = Math.floor(canvasX / (this.size + this.gap));
            var row = Math.floor(canvasY / (this.size + this.gap));

            // check if panel has already been clicked; if so, don't run again
            var key = `${col}-${row}`
            if(this.clickedPanels[key]) {
                return;
            } else {
                this.clickedPanels[key] = true;
            }

            var panel = this.panels[row][col];

            panel.setColor(...this.color, this.opacity);

        }
        // handle mouse events
        this.canvas.addEventListener('mousedown', (e) => { this.clickedPanels = {}; });
        this.canvas.addEventListener('mouseup', (e) => { this.clickedPanels = false });
        this.canvas.addEventListener('mousemove', (e) => { 
            if(!this.clickedPanels) { return; }
            var panel = this.getPanelAtCoords(e.offsetX, e.offsetY);
            if(panel && !this.clickedPanels[`${panel.x}-${panel.y}`]) {
                this.clickedPanels[`${panel.x}-${panel.y}`] = true;
                panel.setColor(...this.color, this.opacity);
            }
        });

        // handle touch events
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.clickedPanels = {}; });
        this.canvas.addEventListener('touchend', (e) => { this.clickedPanels = false });
        this.canvas.addEventListener('touchmove', (e) => {
            if(!this.clickedPanels) { return; }
            var panel = this.getPanelAtCoords(e.pageX, e.pageY);
            if(panel && !this.clickedPanels[`${panel.x}-${panel.y}`]) {
                this.clickedPanels[`${panel.x}-${panel.y}`] = true;
                panel.setColor(...this.color, this.opacity);
            }
        });
    }
    sample() {
        this.canvas.addEventListener('click', (e) => {
            var panel = this.getPanelAtCoords(e.offsetX, e.offsetY);
            if(!panel) { return; }
            this.color = [panel.red,panel.green,panel.blue];
            this.opacity = panel.opacity
        }, {once: true});
        this.canvas.addEventListener('touchstart', (e) => {
            var panel = this.getPanelAtCoords(e.pageX, e.pageY);
            if(!panel) { return; }
            this.color = [panel.red,panel.green,panel.blue];
            this.opacity = panel.opacity
        }, {once: true});

    }
}

module.exports = { Ceiling, ClickableCeiling };
