var THREE = require('three');
var _ = require('lodash');
var dat = require('dat.gui');
var Panel = require('./modules/panel.js');
var Ceiling = require('./modules/ceiling.js');
var Sequence = require('./modules/sequence.js');


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
