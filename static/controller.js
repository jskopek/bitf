// TODO: animating between old and new values
// TODO: two LEDs per ceiling
// TODO: effects for two LEDs

var dat = require('dat.gui');
var {Ceiling, ClickableCeiling} = require('./ceiling.js');
var Sequence = require('./sequence.js');
var Animator = require('./animator.js');



// ----------- CANVAS & CEILING: RENDER INTERACTIVE CEILING IN GUI ---------------------------
// initialize canvas, ceiling, and sequencer
var canvas = document.querySelector('#test');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LEDSize = Math.min(canvas.width, canvas.height) / 4;
var ceiling = new ClickableCeiling(canvas, 2, 4, LEDSize, 2);
// ----------- END CANVAS & CEILING: RENDER CEILING IN GUI -----------------------------------



// ----------- SEQUENCER PART 1: STORES SEQUENCES OF LIGHTS ----------------------------------
var sequence = new Sequence();
// ----------- END SEQUENCER PART 1: STORES SEQUENCES OF LIGHTS ------------------------------



// ---------- SOCKET SERVER: COMMUNICATES WITH SERVER, WHICH SENDS MESSAGE TO PANELS -----------
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
// ---------- END SOCKET SERVER -------------------------------------------------------------------



// ---------- SEQUENCER PART 2: WHEN SEQUENCE CHANGES, ANIMATE CHANGE AND SEND TO CEILING ---------
var animator = new Animator(10, 100);
sequence.on('render', (values, prevValues) => {
    animator.animate(prevValues, values, (stepValues) => {

        // update ceiling with new colors
        ceiling.setColorValues(stepValues);

        // send new colors to server, which will send them to the starfield hardware
        socket.emit('render', stepValues);
    });
})
// ---------- END SEQUENCER PART 2 ----------------------------------------------------------------



// ----------- MICROPHONE -------------------------------------------------------------------------
var Microphone = require('./microphone.js');
var microphone = new Microphone(100);

// modify sequence on microphone changes
microphone.on('volume', (volume) => {
    if(!microphone.visualizeAbsolute) { return; }
    var sequenceStep = Math.floor((sequence.numSteps - 1) * volume)
    ceiling.setColorValues(sequence.sequence[sequenceStep]);
});
microphone.on('volumeIncreased', (volume) => { if(!microphone.visualizeAbsolute) { sequence.next(); }});
microphone.on('volumeDecreased', (volume) => { if(!microphone.visualizeAbsolute) { sequence.prev(); }});
// ----------- END MICROPHONE ---------------------------------------------------------------------



// ------------ LOAD DROPPED SEQUENCES -------------------------------------------------------------
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
// ------------ END LOAD DROPPED SEQUENCES ----------------------------------------------------------



// ------------- GUI --------------------------------------------------------------------------------
const gui = new dat.GUI();
var styleGUI = gui.addFolder('Style');
styleGUI.addColor(ceiling, 'color').listen();
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
    this.save = () => { 
        // generate an array of color arrays for each panel in the ceiling, and overwrite the current sequence step with value
        var panelColorArrays = ceiling.getPanelArray().map((panel) => { return panel.getColorArray(); })
        sequence.save(panelColorArrays); 
    }
    this.create = () => { 
        // generate an array of color arrays for each panel in the ceiling, and create new sequence step with value
        var panelColorArrays = ceiling.getPanelArray().map((panel) => { return panel.getColorArray(); })
        sequence.create(panelColorArrays); 
    }
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

var animatorGUI = gui.addFolder('Animator');
animatorGUI.add(animator, 'numSteps', 10, 100);
animatorGUI.add(animator, 'stepInterval', 100, 5000);
animatorGUI.open();
// ------------- END GUI ----------------------------------------------------------------------------------

// ------------- END GUI ----------------------------------------------------------------------------------
