const EventEmitter = require( 'events' );
const createAudioMeter = require('./volumeMeter.js');

class Microphone extends EventEmitter {
    constructor(sampleRate, sampling) {
		super();
		this.sampleRate = sampleRate || 100;
        this.sampling = sampling || false;
        this.multiplier = 3;
        this.meter = undefined;
        this.previousVolume = 0; // used for volumeIncreased/volumeDecreased events
        this.visualizeAbsolute = true; // track how we want to modify the sequence (absolute value or relative increase/decrease)
        this.sample();
    }
    sample() {
        if(this.sampling && this.meter) { 
            var multipliedVolume = Math.min(this.meter.volume * this.multiplier, 1); // multiply volume by this.multiplier, but make sure its never over 1.0
            this.emit('volume', multipliedVolume) 

            // emit volumeIncreased/volumeDecreased comparison
            if(multipliedVolume > this.previousVolume) { this.emit('volumeIncreased', multipliedVolume, this.previousVolume); }
            else if(multipliedVolume < this.previousVolume) { this.emit('volumeDecreased', multipliedVolume, this.previousVolume); }
            this.previousVolume = multipliedVolume;
        }
        if(this.sampleRate) { setTimeout(() => { this.sample(); }, this.sampleRate); }
    }
    initializeMeter() {
        if(this.meter) { return; }
        navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
            var audioContext = new AudioContext();
            var mediaStreamSource = audioContext.createMediaStreamSource(stream);
            this.meter = createAudioMeter(audioContext);
            mediaStreamSource.connect(this.meter);
        });
    }
}

module.exports = Microphone;
