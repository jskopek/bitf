var dat = require('dat.gui');
var {Ceiling, ClickableCeiling} = require('./ceiling.js');
var Sequence = require('./sequence.js');
var Animator = require('./animator.js');

// initialize canvas, ceiling, and sequencer
var canvas = document.querySelector('#test');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LEDSize = Math.min(canvas.width, canvas.height) / 4;
var ceiling = new ClickableCeiling(canvas, 2, 4, LEDSize, 2);


// WORK IN PROGRESS - ANIMATOR NEEDS TO ANIMATE BETWEEN OLD AND NEW VALUES
var sequence = new Sequence();
//var animator = new Animator(10, 100);
sequence.on('render', (values, prevValues) => {
    Animator(prevValues, values, 10, 100, (animatedValues) => {
        ceiling.render(animatedValues);
    });
})

// ---------- Socket Server -----------
// initialize socket io
var socket = io(); 

// monitor for launchpad sequence change
socket.on('sequence', (sequenceData) => { console.log(sequenceData); sequence.load(sequenceData); });

// monitor for launchpad microphone/sequencer changes
socket.on('configuration', (configData) => {
    console.log(configData);
    if(!window.microphone) { return; }
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


// send ceiling updates to server
ceiling.on('render', (values) => {
    socket.emit('render', values);
    console.log('render', values);
});
// ---------- End Socket Server -----------

// ----------- Microphone -------------
var Microphone = require('./microphone.js');
var microphone = new Microphone(100);

// modify sequence on microphone changes
microphone.on('volume', (volume) => {
    if(!microphone.visualizeAbsolute) { return; }
    var sequenceStep = Math.floor((sequence.numSteps - 1) * volume)
    ceiling.render(sequence.sequence[sequenceStep]);
});
microphone.on('volumeIncreased', (volume) => { if(!microphone.visualizeAbsolute) { sequence.next(); }});
microphone.on('volumeDecreased', (volume) => { if(!microphone.visualizeAbsolute) { sequence.prev(); }});
// ----------- End Microphone -------------


// ------------ Load Dropped Sequences -------------
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
// ------------ End Load Dropped Sequences -------------


// ------------- GUI -----------------
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
sequenceGUI.add(sequence, 'remove');
sequenceGUI.add(sequence, 'download');
sequenceGUI.open();

var SequenceCreation = function() {
    this.save = () => { sequence.save(ceiling.save()); }
    this.create = () => { sequence.create(ceiling.save()); }
}
var sequenceCreation = new SequenceCreation();
var sequencCreationGUI = gui.addFolder('Sequence Creation');
sequencCreationGUI.add(sequenceCreation, 'create');
sequencCreationGUI.add(sequenceCreation, 'save');
sequencCreationGUI.open();

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
// ------------- End GUI -----------------
