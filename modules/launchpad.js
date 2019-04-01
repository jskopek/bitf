const Launchpad = require('launchpad-mini');
const EventEmitter = require( 'events' );
const fs = require('fs');
const path = require('path');

class LaunchpadController extends EventEmitter {
    /* Emits:
     * - configuration (configurationJSON): A visualization configuration; currently either microphone/sequence
     * - sequence (sequenceJSON): A new sequence
     */
    constructor(sequencesDir) {
        super();

        // find sequences
        this.sequences = getJSONFilesList(sequencesDir);

        // map sequences to launchpad keys
        this.btnSequenceDict = mapArrayToMatrix(this.sequences, 8);

        // look for launchpad
        this.detectLaunchpad((pad) => {
            console.log('Launchpad found!');
            this.pad = pad;
            this.pad.reset();
            this.resetSequenceButtons();
            this.pad.on('key', key => { this.handleKeyPress(key); });
        });
    }
    detectLaunchpad(callback) {
        // initialize launchpad
        var pad = new Launchpad();
        pad.connect()
        .then(() => { callback(pad); })
        .catch(() => { setTimeout(() => { this.detectLaunchpad(callback); }, 5000); });
    }
    handleKeyPress(key) {
        if(!this.pad.isPressed(key)) { return; }

        if(key.x == 8) {
            this.triggerConfiguration('microphone', (8 - key.y) / 8);
            this.resetConfigurationButtons();
        } else if(key.y == 8) {
            this.triggerConfiguration('sequencer', (key.x + 1) / 8);
            this.resetConfigurationButtons();
        } else {
            var sequence = this.btnSequenceDict[key.x][key.y]; 
            if(!sequence) { return; }
            this.triggerSequence(sequence);
            this.resetSequenceButtons();
        }

        this.pad.col(this.pad.green.full, key); // set active color
    }
    triggerSequence(sequenceFilename) {
        var sequence = JSON.parse(fs.readFileSync(sequenceFilename));
        this.emit('sequence', sequence, sequenceFilename);
    }
    resetConfigurationButtons() {
        // reset configuration lights
        for(var y = 0; y < 8; y++) { this.pad.col(this.pad.off, [8,y]); }
        for(var x = 0; x < 8; x++) { this.pad.col(this.pad.off, [x,8]); }
    }
    resetSequenceButtons() {
        // set sequence color
        for(var col in this.btnSequenceDict) {
            for(var row in this.btnSequenceDict[col]) {
                this.pad.col(this.pad.red, [parseInt(col),parseInt(row)]); 
            }
        }
    }
    triggerConfiguration(type, level) {
        this.emit('configuration', {'type': type, 'level': level});
    }
}

function getJSONFilesList(sequencesDir) {
    var files = fs.readdirSync(sequencesDir);
    files = files.filter((file) => { return path.extname(file) == '.json'; });
    files = files.map((file) => { return path.join(sequencesDir, file); })
    return files;
}
function mapArrayToMatrix(values, cols) {
    var matrix = {};
    values.forEach((value, i) => {
        var col = i % cols;
        var row = (i - col) / cols;

        if(!matrix[col]) { matrix[col] = {} }

        matrix[col][row] = value;
    });
    return matrix;
}
module.exports = LaunchpadController;
