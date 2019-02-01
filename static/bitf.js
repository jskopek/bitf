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
        this.green = Math.round(Math.random() * 255);
        this.blue = Math.round(Math.random() * 255);
        this.sequence = [];

        this.render();
    }
    render() {
        this.ctx.clearRect(this.x, this.y, this.size, this.size);
        this.ctx.beginPath();
        this.ctx.rect(this.x,this.y,this.size,this.size);
        this.ctx.fillStyle = `rgba(${this.red},${this.green},${this.blue},${this.opacity})`;
        this.ctx.fill();
    }
    setColor(red, green, blue, opacity, playSpeed) {
        if(!playSpeed) { playSpeed = 100; }

        var redSequence = this.generateSequence(this.red, red, 10);
        var greenSequence = this.generateSequence(this.green, green, 10);
        var blueSequence = this.generateSequence(this.blue, blue, 10);
        var opacity = this.generateSequence(this.opacity, opacity, 10);

        var isRunning = this.sequence.length ? true : false;
        this.sequence = _.zip(redSequence, greenSequence, blueSequence, opacity);

        var totalTime = Math.random() * playSpeed;
        var intervalTime = totalTime / this.sequence.length;

        if(!isRunning) {
            this.runSequence(intervalTime, (color) => {
                this.red = Math.round(color[0]);
                this.green = Math.round(color[1]);
                this.blue = Math.round(color[2]);
                this.opacity = color[3];
                this.render()
            });
        }

    }
    save() {
        return [this.red, this.green, this.blue, this.opacity];
    }
    load(values, playSpeed) {
        this.setColor(values[0], values[1], values[2], values[3], playSpeed);
    }
    runSequence(intervalTime, action) {
        action(this.sequence[0]);
        this.sequence.splice(0,1);
        if(this.sequence.length) {
            setTimeout(() => {
                this.runSequence(intervalTime, action)
            }, intervalTime);
        }
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
    load(values, playSpeed) {
        var i = 0;
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                this.panels[row][col].load(values[i], playSpeed);
                i++;
            }
        }
        // send to pusher
        fetch('/push/?sequence=' + encodeURIComponent(JSON.stringify(values)));
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

class Sequence {
    constructor(ceiling) {
        this.ceiling = ceiling;
        this.step = 1;
        this.numSteps = 0;

        this.running = false;
        this.loop = false;
        this.boomerang = false;
        this.directionForward = true;
        this.playSpeed = 100;
        this.sequence = [];

        var sequenceStr = localStorage.getItem('sequence');
        if(sequenceStr) {
            this.load(JSON.parse(sequenceStr));
        }
    }
    load(sequence) {
        this.sequence = sequence;
        this.step = 1;
        this.numSteps = this.sequence.length;
        if(this.sequence.length) {
            this.ceiling.load(this.sequence[this.step - 1]);
        }
    }
    save() {
        this.sequence[this.step - 1] = ceiling.save();
        this.storeLocally();
    }
    create() {
        this.sequence.push(ceiling.save());
        this.steps += 1;
        this.step += 1;
        this.numSteps = this.sequence.length;
        this.storeLocally();
    }
    storeLocally() {
        localStorage.setItem('sequence', JSON.stringify(this.sequence));
    }
    remove() {
        if(this.step <= 1) { return; }
        this.sequence.splice(this.step - 1,1);
        this.numSteps = this.sequence.length;
        this.storeLocally();
        this.prev();
    }
    next() {
        if(this.step >= this.sequence.length) { return; }
        this.step += 1;
        this.ceiling.load(this.sequence[this.step - 1], this.playSpeed);
    }
    prev() {
        if(this.step <= 1) { return; }
        this.step -= 1;
        this.ceiling.load(this.sequence[this.step - 1], this.playSpeed);
    }
    play() {
        this.running = true;
        this.run();
    }
    stop() {
        this.running = false;
    }
    run() {
        if(!this.running) { return; }
        var isFinalStep = this.step == this.sequence.length ? true : false
        var isFirstStep = this.step == 1 ? true : false
        if(isFirstStep && this.boomerang && !this.directionForward) {
            this.directionForward = true;
        } else if(isFinalStep && this.boomerang && this.directionForward) {
            this.directionForward = false;
        } else if(!isFinalStep && this.directionForward) {
            this.next();
        } else if(!isFirstStep && !this.directionForward) {
            this.prev();
        } else if(isFinalStep && this.loop) {
            this.step = 1;
        } else {
            this.running = false;
        }

        setTimeout(() => { this.run() }, this.playSpeed);
    }
    download() {
        var exportObj = this.sequence;
        var exportName = 'sequence';

        // Source: https://stackoverflow.com/a/30800715
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
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
styleGUI.addColor(ceiling, 'color').listen();
styleGUI.add(ceiling, 'opacity', 0, 1).listen();
styleGUI.add(ceiling, 'sample');
styleGUI.open();

var sequenceGUI = gui.addFolder('Sequence');
sequenceGUI.add(sequence, 'step').listen();
sequenceGUI.add(sequence, 'numSteps').listen();
sequenceGUI.add(sequence, 'next');
sequenceGUI.add(sequence, 'prev');
sequenceGUI.add(sequence, 'save');
sequenceGUI.add(sequence, 'create');
sequenceGUI.add(sequence, 'remove');
sequenceGUI.add(sequence, 'download');
sequenceGUI.open();
var sequenceRunnerGUI = gui.addFolder('Sequence Runner');
sequenceRunnerGUI.add(sequence, 'play');
sequenceRunnerGUI.add(sequence, 'stop');
sequenceRunnerGUI.add(sequence, 'loop')
sequenceRunnerGUI.add(sequence, 'boomerang')
sequenceRunnerGUI.add(sequence, 'directionForward').listen();
sequenceRunnerGUI.add(sequence, 'playSpeed', 100, 3000)
sequenceRunnerGUI.open();

// load dropped sequences
window.addEventListener("dragover", (e) => { e.preventDefault(); },false);
window.addEventListener("drop", (e) => {
    e.preventDefault();

    var file = e.dataTransfer.items[0].getAsFile();
    var reader = new FileReader();
    reader.onload = (evt) => {
        var droppedSequence = JSON.parse(evt.target.result);
        sequence.load(droppedSequence);
    }
    reader.readAsText(file);

},false);
