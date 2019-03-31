class LED {
    constructor(canvas, x, y, size) {
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.size = size;
        this.opacity = 1;
        this.red = Math.round(Math.random() * 255);
        this.green = Math.round(Math.random() * 255);
        this.blue = Math.round(Math.random() * 255);
        this.sequence = [];

        this.render();
    }
    render() {
        this.ctx.clearRect(this.x, this.y, this.size, this.size);
        this.ctx.beginPath();
        this.ctx.rect(this.x,this.y,this.size,this.size);
        this.ctx.fillStyle = `rgba(${this.red},${this.green},${this.blue},${this.opacity})`;
        this.ctx.fill();
    }
    setColor(red, green, blue, opacity) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.opacity = opacity;
        this.render()
    }
    setColorSequence(red, green, blue, opacity, playSpeed) {
        var redSequence = this.generateSequence(this.red, red, 10);
        var greenSequence = this.generateSequence(this.green, green, 10);
        var blueSequence = this.generateSequence(this.blue, blue, 10);
        var opacity = this.generateSequence(this.opacity, opacity, 10);

        var isRunning = this.sequence.length ? true : false;
        this.sequence = _.zip(redSequence, greenSequence, blueSequence, opacity);

        var totalTime = Math.random() * playSpeed;
        var intervalTime = totalTime / this.sequence.length;

        if(!isRunning) {
            this.runSequence(intervalTime, (color) => {
                this.red = Math.round(color[0]);
                this.green = Math.round(color[1]);
                this.blue = Math.round(color[2]);
                this.opacity = color[3];
                this.render()
            });
        }
    }
    save() {
        return [this.red, this.green, this.blue, this.opacity];
    }
    runSequence(intervalTime, action) {
        action(this.sequence[0]);
        this.sequence.splice(0,1);
        if(this.sequence.length) {
            setTimeout(() => {
                this.runSequence(intervalTime, action)
            }, intervalTime);
        }
    }
    generateSequence(from, to, numSteps) {
        var stepDiff = (to - from) / numSteps;
        var steps = [];
        for(var i = 1; i <= numSteps; i++) {
            var val = from + stepDiff * i
            val = parseFloat(val.toFixed(2));
            steps.push(val);
        }
        return steps;
    }
    colorStr() {
        return `rgb(${this.red},${this.green},${this.blue})`
    }
}
module.exports = LED;
