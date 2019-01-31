var _ = require('lodash');
var dat = require('dat.gui');
var Panel = require('./modules/panel.js');
var Ceiling = require('./modules/ceiling.js');
var Sequence = require('./modules/sequence.js');


// initialize
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x505050 );

// room
camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
camera.rotation.x = 1;


room = new THREE.LineSegments(
    new THREE.BoxLineGeometry( 10, 6, 10, 10, 10, 10 ), //x, z, y
    new THREE.LineBasicMaterial( { color: 0x808080 } )
);
room.geometry.translate( 0, 3, 0 );
scene.add( room );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

// VR
renderer.vr.enabled = true;
document.body.appendChild( WEBVR.createButton( renderer ) );


//var controls = new THREE.TrackballControls(camera, renderer.domElement);
//controls.rotateSpeed = 1.0;
//controls.zoomSpeed = 1.2;
//controls.panSpeed = 0.8;
//controls.noZoom = false;
//controls.noPan = false;
//controls.staticMoving = true;
//controls.dynamicDampingFactor = 0.3;
//controls.keys = [ 65, 83, 68 ];

renderer.setAnimationLoop(() => {
    renderer.render( scene, camera );
    //ceiling.animate();
    //controls.update();
});

// Initialize scene
var offsetX = -5;
var offsetY = -5;
var offsetZ = 6;
var ceiling = new Ceiling(scene, 10, 10, 1, 0.1, offsetX, offsetY, offsetZ);
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

var cameraGUI = gui.addFolder('Camera');
cameraGUI.add(camera.rotation, 'x', -3.14 * 2, 3.14).listen()
cameraGUI.add(camera.rotation, 'y', -3.14, 3.14).listen()

cameraGUI.open();

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
