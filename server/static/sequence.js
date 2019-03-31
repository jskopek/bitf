class Sequence {
    constructor(ceiling) {
        this.ceiling = ceiling;
        this.step = 1;
        this.numSteps = 0;

        this.running = false;
        this.loop = false;
        this.boomerang = false;
        this.directionForward = true;
        this.playSpeed = 1000;
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
            this.ceiling.render(this.sequence[this.step - 1]);
        }
    }
    save() {
        this.sequence[this.step - 1] = ceiling.save();
        this.storeLocally();
    }
    create() {
        this.sequence.push(ceiling.save());
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
        this.ceiling.render(this.sequence[this.step - 1], this.playSpeed);
    }
    prev() {
        if(this.step <= 1) { return; }
        this.step -= 1;
        this.ceiling.render(this.sequence[this.step - 1], this.playSpeed);
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
