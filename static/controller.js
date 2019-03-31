var _ = require('lodash');
var dat = require('dat.gui');
var {Ceiling, ClickableCeiling} = require('./ceiling.js');
var {Panel, PanelManager} = require('./panel.js');
var Sequence = require('./sequence.js');
var Microphone = require('./microphone.js');

var socket = io('http://localhost:4000');
socket.on('sequence', (sequenceData) => {
    sequence.load(sequenceData);
});

// initialize
var canvas = document.querySelector('#test');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LEDSize = Math.min(canvas.width, canvas.height) / 10;
var ceiling = new ClickableCeiling(canvas, 10, 10, LEDSize, 2);

// initialize remote panels
var panelManager = new PanelManager();
panelManager.add(new Panel('http://localhost:3003', 0, 0));
panelManager.add(new Panel('http://localhost:3004', 0, 5));
panelManager.add(new Panel('http://localhost:3005', 5, 0));
panelManager.add(new Panel('http://localhost:3006', 5, 5));
ceiling.on('render', (values) => { panelManager.send(ceiling); })

var sequence = new Sequence(ceiling);

// initialize microphone
var microphone = new Microphone(100);
microphone.on('volume', (volume) => {
	var mod = Math.min(volume * 3, 1); // multiply volume by 3, but make sure its never over 1.0
	console.log(mod);
	var sequenceStep = Math.floor((sequence.numSteps - 1) * mod)
	ceiling.render(sequence.sequence[sequenceStep]);
});

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


// look for commands from launchpad socket server
var socket = io('http://localhost:4000');
socket.on('sequence', (sequenceData) => { sequence.load(sequenceData); });
socket.on('configuration', (configData) => {
    console.log(configData);
    if(configData.type == 'microphone') {
        sequence.stop();
        microphone.initializeMeter();
        microphone.sampling = true;
        microphone.sampleRate = configData.level * 500;
    } else if(configData.type == 'sequencer') {
        microphone.sampling = false;
        sequence.play();
        sequence.playSpeed = configData.level * 1500;
    }
});



