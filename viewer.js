var THREE = require('three');
var _ = require('lodash');
var dat = require('dat.gui');

class Panel {
    constructor(scene, x, y, size) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.size = size;
        this.red = Math.round(Math.random() * 255);
        this.green = Math.round(Math.random() * 255);
        this.blue = Math.round(Math.random() * 255);

        var geometry = new THREE.BoxGeometry( this.size, this.size, .1 );
        var material = new THREE.MeshBasicMaterial( { color: `rgb(${this.red},${this.green},${this.blue})` } );
        this.cube = new THREE.Mesh( geometry, material );
        this.scene.add( this.cube );
        this.cube.position.set(this.x,this.y,0);
    }
    setColor(red, green, blue, opacity, playSpeed) {
        this.red = Math.round(red);
        this.green = Math.round(green);
        this.blue = Math.round(blue);

        this.cube.material.color = new THREE.Color(`rgb(${this.red},${this.green},${this.blue})`)
    }
    load(values, playSpeed) {
        this.setColor(values[0], values[1], values[2], values[3], playSpeed);
    }

}

class Ceiling {
    constructor(scene, rows, cols, size, gap) {
        this.scene = scene;
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
                var panel = new Panel(this.scene, x, y, this.size - this.gap);
                rowPanels.push(panel);
            }
            this.panels.push(rowPanels);
        }
    }
    animate() {
        _.each(this.panels, (row) => {
            _.each(row, (panel) => {
                panel.cube.rotation.y += 0.01;
            });
        });
    }
    load(values, playSpeed) {
        var i = 0;
        for(var row = 0; row < this.rows; row++) {
            for(var col = 0; col < this.cols; col++) {
                this.panels[row][col].load(values[i], playSpeed);
                i++;
            }
        }
    }

}


class Sequence {
    constructor(ceiling) {
        this.ceiling = ceiling;
        this.step = 0;
        this.numSteps = 0;

        this.running = false;
        this.loop = false;
        this.boomerang = false;
        this.directionForward = true;
        this.playSpeed = 100;
        this.sequence = [];

        try {
            var sequence = JSON.parse(localStorage.getItem('sequence'));
            this.load(sequence);
        } catch {
        }
    }
    load(sequence) {
        this.sequence = sequence;
        this.step = 0;
        this.numSteps = this.sequence.length;
        if(this.sequence.length) {
            this.ceiling.load(this.sequence[this.step]);
        }
    }
    next() {
        if(this.step >= this.sequence.length - 1) { return; }
        this.step += 1;
        this.ceiling.load(this.sequence[this.step], this.playSpeed);
    }
    prev() {
        if(this.step <= 0) { return; }
        this.step -= 1;
        this.ceiling.load(this.sequence[this.step], this.playSpeed);
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
        var isFinalStep = this.step == this.sequence.length - 1 ? true : false
        var isFirstStep = this.step == 0 ? true : false
        if(isFirstStep && this.boomerang && !this.directionForward) {
            this.directionForward = true;
        } else if(isFinalStep && this.boomerang && this.directionForward) {
            this.directionForward = false;
        } else if(!isFinalStep && this.directionForward) {
            this.next();
        } else if(!isFirstStep && !this.directionForward) {
            this.prev();
        } else if(isFinalStep && this.loop) {
            this.step = 0;
        } else {
            this.running = false;
        }

        setTimeout(() => { this.run() }, this.playSpeed);
    }
}


// initialize
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 100;
camera.position.x = 30;
camera.position.y = 30;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var ceiling = new Ceiling(scene, 10, 10, 8, 2);

function animate() {
    requestAnimationFrame( animate );
    ceiling.animate();
    renderer.render( scene, camera );
}
animate();



var sequence = new Sequence(ceiling);

// GUI
const gui = new dat.GUI();

var sequenceGUI = gui.addFolder('Sequence');
sequenceGUI.add(sequence, 'step').listen();
sequenceGUI.add(sequence, 'numSteps').listen();
sequenceGUI.add(sequence, 'next');
sequenceGUI.add(sequence, 'prev');
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
