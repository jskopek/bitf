var _ = require('lodash');
var dat = require('dat.gui');
var {Ceiling, ClickableCeiling} = require('./ceiling.js');
var BonjourPanel = require('../modules/bonjourPanel.js');
var BonjourPanelManager = require('../modules/bonjourPanelManager.js');
var Sequence = require('./sequence.js');
var Microphone = require('./microphone.js');

// initialize canvas, ceiling, and sequencer
var canvas = document.querySelector('#test');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LEDSize = Math.min(canvas.width, canvas.height) / 10;
var ceiling = new ClickableCeiling(canvas, 10, 10, LEDSize, 2);

var sequence = new Sequence(ceiling);

// initialize socket io
var socket = io(); 


// Microphone
var microphone = new Microphone(100);

// modify sequence on microphone changes
microphone.on('volume', (volume) => {
    if(!microphone.visualizeAbsolute) { return; }
    var sequenceStep = Math.floor((sequence.numSteps - 1) * volume)
    ceiling.render(sequence.sequence[sequenceStep]);
});
microphone.on('volumeIncreased', (volume) => { if(!microphone.visualizeAbsolute) { sequence.next(); }});
microphone.on('volumeDecreased', (volume) => { if(!microphone.visualizeAbsolute) { sequence.prev(); }});


// GUI
const gui = new dat.GUI();
var styleGUI = gui.addFolder('Style');
styleGUI.addColor(ceiling, 'color').listen();
styleGUI.add(ceiling, 'opacity', 0, 1).listen();
styleGUI.add(ceiling, 'sample');
styleGUI.add(ceiling, 'fill');
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
sequenceRunnerGUI.add(sequence, 'playSpeed', 100, 3000).listen();
sequenceRunnerGUI.open();

var microphoneGUI = gui.addFolder('Microphone Input');
microphoneGUI.add(microphone, 'initializeMeter');
microphoneGUI.add(microphone, 'sampling').listen();
microphoneGUI.add(microphone, 'sampleRate', 20, 500).listen();
microphoneGUI.add(microphone, 'multiplier', 0.2, 10).listen();
microphoneGUI.add(microphone, 'visualizeAbsolute');
microphoneGUI.open();

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

// initialize remote panel manager
var panelManager = new BonjourPanelManager();
ceiling.on('render', (values) => { panelManager.send(ceiling); })
window.panels.forEach((panelData) => {
    panelManager.add(new BonjourPanel(`http://${panelData.address}:${panelData.port}`, panelData.offsetRow, panelData.offsetCol));
});
socket.on('panel', (panelData) => {
    panelManager.add(new BonjourPanel(`http://${panelData.address}:${panelData.port}`, panelData.offsetRow, panelData.offsetCol));
});

// monitor for launchpad commands
socket.on('sequence', (sequenceData) => { console.log(sequenceData); sequence.load(sequenceData); });
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

