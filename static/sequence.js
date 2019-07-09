const EventEmitter = require( 'events' );

class Sequence extends EventEmitter {
    // emits 'render' with sequence values every time a step is changed
    constructor() {
        super();

        this.step = 1;
        this.numSteps = 0;

        this.running = false;
        this.loop = true;
        this.boomerang = true;
        this.directionForward = true;
        this.playSpeed = 150;
        this.sequence = [];

        var sequenceStr = localStorage.getItem('sequence');
        if(sequenceStr) {
            this.load(JSON.parse(sequenceStr));
        }
    }
    load(sequence) {
        this.sequence = sequence;
        this.step = 1;
        this.numSteps = this.sequence.length;
        if(this.sequence.length) {
            this.emit('render', this.sequence[this.step - 1], this.sequence[this.step - 1]);
        }
    }
    save(value) {
        this.sequence[this.step - 1] = value;
        this.storeLocally();
    }
    create(value) {
        this.sequence.push(value);
        this.steps += 1;
        this.step += 1;
        this.numSteps = this.sequence.length;
        this.storeLocally();
    }
    storeLocally() {
        localStorage.setItem('sequence', JSON.stringify(this.sequence));
    }
    remove() {
        if(this.step <= 1) { return; }
        this.sequence.splice(this.step - 1,1);
        this.numSteps = this.sequence.length;
        this.storeLocally();
        this.prev();
    }
    next() {
        if(this.step >= this.sequence.length) { return; }
        this.step += 1;
        this.emit('render', this.sequence[this.step - 1], this.sequence[this.step - 2]);
    }
    prev() {
        if(this.step <= 1) { return; }
        this.step -= 1;
        var currValue = this.sequence[this.step - 1];
        var prevValue = this.sequence[(this.step - 2 >= 0) ? this.step - 2 : 0];
        this.emit('render', currValue, prevValue);
    }
    play() {
        if(this.running) { return; }
        this.running = true;
        this.run();
    }
    stop() {
        this.running = false;
    }
    run() {
        if(!this.running) { return; }
        var isFinalStep = this.step == this.sequence.length ? true : false
        var isFirstStep = this.step == 1 ? true : false
        if(isFirstStep && this.boomerang && !this.directionForward) {
            this.directionForward = true;
        } else if(isFinalStep && this.boomerang && this.directionForward) {
            this.directionForward = false;
        } else if(!isFinalStep && this.directionForward) {
            this.next();
        } else if(!isFirstStep && !this.directionForward) {
            this.prev();
        } else if(isFinalStep && this.loop) {
            this.step = 1;
        } else {
            this.running = false;
        }

        setTimeout(() => { this.run() }, this.playSpeed);
    }
    download() {
        var exportObj = this.sequence;
        var exportName = 'sequence';

        // Source: https://stackoverflow.com/a/30800715
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

module.exports = Sequence;
