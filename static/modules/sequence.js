class Sequence {
    constructor(ceiling) {
        this.ceiling = ceiling;
        this.step = 0;
        this.numSteps = 0;

        this.running = false;
        this.loop = false;
        this.boomerang = false;
        this.directionForward = true;
        this.playSpeed = 100;
        this.sequence = [];

        try {
            var sequence = JSON.parse(localStorage.getItem('sequence'));
            this.load(sequence);
        } catch {
        }
    }
    load(sequence) {
        this.sequence = sequence;
        this.step = 0;
        this.numSteps = this.sequence.length;
        if(this.sequence.length) {
            this.ceiling.load(this.sequence[this.step]);
        }
    }
    next() {
        if(this.step >= this.sequence.length - 1) { return; }
        this.step += 1;
        this.ceiling.load(this.sequence[this.step], this.playSpeed);
    }
    prev() {
        if(this.step <= 0) { return; }
        this.step -= 1;
        this.ceiling.load(this.sequence[this.step], this.playSpeed);
    }
    play() {
        this.running = true;
        this.run();
    }
    stop() {
        this.running = false;
    }
    run() {
        if(!this.running) { return; }
        var isFinalStep = this.step == this.sequence.length - 1 ? true : false
        var isFirstStep = this.step == 0 ? true : false
        if(isFirstStep && this.boomerang && !this.directionForward) {
            this.directionForward = true;
        } else if(isFinalStep && this.boomerang && this.directionForward) {
            this.directionForward = false;
        } else if(!isFinalStep && this.directionForward) {
            this.next();
        } else if(!isFirstStep && !this.directionForward) {
            this.prev();
        } else if(isFinalStep && this.loop) {
            this.step = 0;
        } else {
            this.running = false;
        }

        setTimeout(() => { this.run() }, this.playSpeed);
    }
}

module.exports = Sequence;
