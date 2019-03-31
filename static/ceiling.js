const EventEmitter = require( 'events' );
var LED = require('./led.js');

class Ceiling extends EventEmitter {
    /* Represents the complete tent ceiling. Manages the individual LEDs */
    constructor(canvas, rows, cols, size, gap) {
        super();
        this.canvas = canvas;
        this.rows = rows;
        this.cols = cols;
        this.size = size;
        this.gap = gap;
        this.leds = [];

        for(var row = 0; row < rows; row++) {
            var rowLEDs = [];
            for(var col = 0; col < cols; col++) {
                var x = col * (this.size + this.gap);
                var y = row * (this.size + this.gap);
                var led = new LED(this.canvas, x, y, this.size - this.gap);
                rowLEDs.push(led);
            }
            this.leds.push(rowLEDs);
        }
    }
    save() {
        var values = []
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                values.push(this.leds[row][col].save());
            }
        }
        return values;
    }
    render(values, playSpeed) {
        var i = 0;
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                var color = values[i];
                this.leds[row][col].setColor(color[0], color[1], color[2], color[3], playSpeed);
                i++;
            }
        }
        this.emit('render', values);
        // send to pusher
        //fetch('/push/?sequence=' + encodeURIComponent(JSON.stringify(values)));
    }
}

class ClickableCeiling extends Ceiling {
    /* A variant of the Ceiling that allows user to change properties of LEDs by clicking on them */
    getLEDAtCoords(x, y) {
        var col = Math.floor(x / (this.size + this.gap));
        var row = Math.floor(y / (this.size + this.gap));
        try {
            return this.leds[row][col];
        } catch {
            return false;
        }
    }
    constructor(canvas, rows, cols, size, gap, color, opacity) {
        super(canvas, rows, cols, size, gap);
        this.color = color || [40,180,105];
        this.opacity = opacity || 1;


        // function that modifies led color based on touch location
        var setLEDColor = (canvasX, canvasY) => {
            if(!this.clickedLEDs) { return; }

            var col = Math.floor(canvasX / (this.size + this.gap));
            var row = Math.floor(canvasY / (this.size + this.gap));

            // check if led has already been clicked; if so, don't run again
            var key = `${col}-${row}`
            if(this.clickedLEDs[key]) {
                return;
            } else {
                this.clickedLEDs[key] = true;
            }

            var led = this.leds[row][col];

            led.setColor(...this.color, this.opacity);

        }
        // handle mouse events
        this.canvas.addEventListener('mousedown', (e) => { this.clickedLEDs = {}; });
        this.canvas.addEventListener('mouseup', (e) => { this.clickedLEDs = false });
        this.canvas.addEventListener('mousemove', (e) => { 
            if(!this.clickedLEDs) { return; }
            var led = this.getLEDAtCoords(e.offsetX, e.offsetY);
            if(led && !this.clickedLEDs[`${led.x}-${led.y}`]) {
                this.clickedLEDs[`${led.x}-${led.y}`] = true;
                led.setColor(...this.color, this.opacity);
            }
        });

        // handle touch events
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.clickedLEDs = {}; });
        this.canvas.addEventListener('touchend', (e) => { this.clickedLEDs = false });
        this.canvas.addEventListener('touchmove', (e) => {
            if(!this.clickedLEDs) { return; }
            var led = this.getLEDAtCoords(e.pageX, e.pageY);
            if(led && !this.clickedLEDs[`${led.x}-${led.y}`]) {
                this.clickedLEDs[`${led.x}-${led.y}`] = true;
                led.setColor(...this.color, this.opacity);
            }
        });
    }
    sample() {
        this.canvas.addEventListener('click', (e) => {
            var led = this.getLEDAtCoords(e.offsetX, e.offsetY);
            if(!led) { return; }
            this.color = [led.red,led.green,led.blue];
            this.opacity = led.opacity
        }, {once: true});
        this.canvas.addEventListener('touchstart', (e) => {
            var led = this.getLEDAtCoords(e.pageX, e.pageY);
            if(!led) { return; }
            this.color = [led.red,led.green,led.blue];
            this.opacity = led.opacity
        }, {once: true});

    }
    fill() {
        this.leds.forEach((row) => {
            row.forEach((led) => {
                console.log(led);
                led.setColor(...this.color, this.opacity); 
            });
        });
    }
}

module.exports = { Ceiling, ClickableCeiling };
