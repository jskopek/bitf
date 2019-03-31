const EventEmitter = require( 'events' );
const createAudioMeter = require('./volumeMeter.js');

class Microphone extends EventEmitter {
    constructor(sampleRate) {
		super();

		this.sampleRate = sampleRate || 100;

        navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
            console.log(stream);

			var audioContext = new AudioContext();
			var mediaStreamSource = audioContext.createMediaStreamSource(stream);
			var meter = createAudioMeter(audioContext);
			mediaStreamSource.connect(meter)

			setInterval(() => { this.emit('volume', meter.volume); }, this.sampleRate);
        });
    }
}

module.exports = Microphone;
