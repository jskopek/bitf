var _ = require('lodash');
var dat = require('dat.gui');
var {Ceiling, ClickableCeiling} = require('./ceiling.js');
var Sequence = require('./sequence.js');

// initialize
var canvas = document.querySelector('#test');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LEDSize = Math.min(canvas.width, canvas.height) / 10;
var ceiling = new ClickableCeiling(canvas, 10, 10, LEDSize, 2);


// send ceiling render updates to viewer
class Remote {
    /* The remote LED controller (e.g. a Raspberry PI) */
    constructor(url, rows, cols, offsetRow, offsetCol) {
        this.url = url
        this.rows = rows;
        this.cols = cols;
        this.offsetRow = offsetRow;
        this.offsetCol = offsetCol;
    }
    send(values) {
        values = _.map(values, (val) => { return `rgb(${val[0]},${val[1]},${val[2]})`; });
        fetch(this.url + '/push/?colors=' + encodeURIComponent(JSON.stringify(values)));
    }
}


var rem = new Remote('http://localhost:3003');
ceiling.on('render', (values) => {
    rem.send(values);
});

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