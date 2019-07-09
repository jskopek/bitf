//function setColorSequence(red, green, blue, numSteps) {
//    var redSequence = this.generateSequence(this.red, red, numSteps);
//    var greenSequence = this.generateSequence(this.green, green, numSteps);
//    var blueSequence = this.generateSequence(this.blue, blue, numSteps);
//
//    var isRunning = this.sequence.length ? true : false;
//    this.sequence = _.zip(redSequence, greenSequence, blueSequence, opacity);
//
//
//}
//function generateSequence(from, to, numSteps) {
//    var stepDiff = (to - from) / numSteps;
//    var steps = [];
//    for(var i = 1; i <= numSteps; i++) {
//        var val = from + stepDiff * i
//        val = parseFloat(val.toFixed(2));
//        steps.push(val);
//    }
//    return steps;
//}
//


// WORK IN PROGRESS - ANIMATOR NEEDS TO ANIMATE BETWEEN OLD AND NEW VALUES
function Animator(prevValues, values, numSteps, stepInterval, animatedValueFn) {
    console.log('Animator', numSteps, stepInterval);
    var currentStep = 0;

    var animate = () => {
        var animatedValues = values;
        animatedValueFn(animatedValues);

        currentStep += 1;
        if(currentStep < numSteps) {
            console.log('Animator.setInterval', currentStep);
            setTimeout(animate, stepInterval);
        }
    }
    animate();
}
module.exports = Animator
