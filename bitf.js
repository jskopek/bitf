var _ = require('lodash');
var dat = require('dat.gui');

class Panel {
    constructor(canvas, x, y, size) {
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.size = size;
        this.opacity = 1;
        this.red = Math.round(Math.random() * 255);
        this.blue = Math.round(Math.random() * 255);
        this.green = Math.round(Math.random() * 255);

        this.render();
        setInterval(() => {
            this.render();
        }, 1000);
    }
    render() {
        this.ctx.beginPath();
        this.ctx.rect(this.x,this.y,this.size,this.size);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.rect(this.x,this.y,this.size,this.size);
        this.ctx.fillStyle = `rgba(${this.red},${this.blue},${this.green},${this.opacity})`;
        this.ctx.fill();
    }
    setOpacity(opacity) {
        var sequence = this.generateSequence(this.opacity, opacity, 10);
        this.runSequence(sequence, 500, (opacity) => {
            this.opacity = opacity;
            this.render()
        });
    }
    setColor(red, blue, green) {
        var redSequence = this.generateSequence(this.red, red, 10);
        var blueSequence = this.generateSequence(this.blue, blue, 10);
        var greenSequence = this.generateSequence(this.green, green, 10);
        var sequence = _.zip(redSequence, blueSequence, greenSequence);
        this.runSequence(sequence, Math.random() * 500, (color) => {
            this.red = color[0];
            this.blue = color[1];
            this.green = color[2];
            this.render()
        });

    }
    save() {
        return [this.red, this.blue, this.green, this.opacity];
    }
    load(values) {
        this.setColor(values[0], values[1], values[2]);
        this.setOpacity(values[3]);
    }
    runSequence(sequence, time, action) {
        var step = 0;
        var numSteps = sequence.length;
        var intervalTime = time / numSteps;
        var transition = setInterval(() => {
            action(sequence[step]);
            step += 1;
            if(step == numSteps) {
                return clearInterval(transition);
            }
        }, intervalTime);
    }
    generateSequence(from, to, numSteps) {
        var stepDiff = (to - from) / numSteps;
        var steps = [];
        for(var i = 1; i <= numSteps; i++) {
            var val = from + stepDiff * i
            val = parseFloat(val.toFixed(2));
            steps.push(val);
        }
        return steps;
    }
}

class Ceiling {
    constructor(canvas, rows, cols, size, gap) {
        this.canvas = canvas;
        this.rows = rows;
        this.cols = cols;
        this.size = size;
        this.gap = gap || 2;
        this.panels = [];

        for(var row = 0; row < rows; row++) {
            var rowPanels = [];
            for(var col = 0; col < cols; col++) {
                var x = col * (this.size + this.gap);
                var y = row * (this.size + this.gap);
                var panel = new Panel(this.canvas, x, y, this.size);
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
    load(values) {
        var i = 0;
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                this.panels[row][col].load(values[i]);
                i++;
            }
        }
    }
}

class ClickableCeiling extends Ceiling {
    constructor(canvas, rows, cols, size, gap, color, opacity) {
        super(canvas, rows, cols, size, gap);
        this.clickedPanels = false;
        this.color = color || [40,100,105];
        this.opacity = opacity || 1;

        this.canvas.addEventListener('mousemove', (e) => {
            if(!this.clickedPanels) { return; }

            var col = Math.floor(e.offsetX / (this.size + this.gap));
            var row = Math.floor(e.offsetY / (this.size + this.gap));

            // check if panel has already been clicked; if so, don't run again
            var key = `${col}-${row}`
            if(this.clickedPanels[key]) {
                return;
            } else {
                this.clickedPanels[key] = true;
            }

            var panel = this.panels[row][col];

            panel.setColor(...this.targetColor);
            panel.setOpacity(this.targetOpacity);
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.clickedPanels = {};
            this.targetOpacity = this.opacity;
            this.targetColor = this.color;
        });
        this.canvas.addEventListener('mouseup', (e) => {
            this.clickedPanels = false;
        });
    }
}

class Sequence {
    constructor(ceiling) {
        this.ceiling = ceiling;
        this.step = 0;
        this.numSteps = 0;
        try {
            this.sequence = JSON.parse(localStorage.getItem('sequence'));
            this.numSteps = this.sequence.length;
        } catch {
            this.sequence = []
        }
        if(this.sequence.length) {
            this.ceiling.load(this.sequence[this.step]);
        }
    }
    save() {
        this.sequence.push(ceiling.save());
        this.steps += 1;
        this.numSteps = this.sequence.length;
        this.storeLocally();
    }
    storeLocally() {
        localStorage.setItem('sequence', JSON.stringify(this.sequence));
    }
    remove() {
        if(this.step < 1) { return; }
        this.sequence.splice(this.step,1);
        this.numSteps = this.sequence.length;
        this.storeLocally();
        this.prev();
    }
    next() {
        if(this.step >= this.sequence.length - 1) { return; }
        this.step += 1;
        console.log(this.sequence.length, this.step, this.sequence[this.step]);
        this.ceiling.load(this.sequence[this.step]);
    }
    prev() {
        if(this.step <= 0) { return; }
        this.step -= 1;
        console.log(this.sequence.length, this.step, this.sequence[this.step]);
        this.ceiling.load(this.sequence[this.step]);
    }
}


// initialize
var canvas = document.querySelector('#test');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var panelSize = Math.min(canvas.width, canvas.height) / 10;
var ceiling = new ClickableCeiling(canvas, 10, 10, panelSize, 2);

var sequence = new Sequence(ceiling);

// GUI
const gui = new dat.GUI();
var styleGUI = gui.addFolder('Style');
styleGUI.addColor(ceiling, 'color');
styleGUI.add(ceiling, 'opacity', 0, 1);
styleGUI.open();

var sequenceGUI = gui.addFolder('Sequence');
sequenceGUI.add(sequence, 'step').listen();
sequenceGUI.add(sequence, 'numSteps').listen();
sequenceGUI.add(sequence, 'next');
sequenceGUI.add(sequence, 'prev');
sequenceGUI.add(sequence, 'save');
sequenceGUI.add(sequence, 'remove');
sequenceGUI.open();
