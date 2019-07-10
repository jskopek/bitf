var {flattenMatrixOnce, groupValuesIntoArrays} = require('./utils.js');
var _ = require('lodash');

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

function calculateValueInRange(from, to, pct) {
    /* calculates a value from from-to based on provided pct value
     * a pct value of 0.0 returns from, 
     * a pct value of 1.0 returns to,
     * a pct value of 0.5 returns a value half way between from and to */
    var diff = to - from;
    var pctValue = parseInt(diff * pct)
    return from + pctValue;
}

// WORK IN PROGRESS - ANIMATOR NEEDS TO ANIMATE BETWEEN OLD AND NEW VALUES
class Animator {
    constructor(numSteps, stepInterval) {
        this.numSteps = numSteps;
        this.stepInterval = stepInterval;
        this.stepFnIdentifier = undefined;
    }
    animate(prevRgbArrays, rgbArrays, animatedValueFn) {
        // clear any existing animation instances before animating again
        clearTimeout(this.stepFnIdentifier);

        // convert [[R,G,B],...] arrays to [R,G,B,R,G,B,...]; makes it easier for comparison
        var flattenedValues = flattenMatrixOnce(rgbArrays)
        var flattenedPrevValues = flattenMatrixOnce(prevRgbArrays)


        // quick check
        if(flattenedValues.length != flattenedPrevValues.length) {
            console.error(`Animator cannot animate with differing sized prevRgbArrays and rgbArrays. flattenedValues.length=${flattenedValues.length} flattenedPrevValues.length=${flattenedPrevValues.length}`);
            return
        }

        // zip old and new values together for easier calculation of step values
        var flattenedOldNewValues = _.zip(flattenedPrevValues, flattenedValues);

        var currentStep = 0;

        var step = () => {
            // determine animation percent from 0.0-1.0
            var animationPct = currentStep / this.numSteps;

            // generate a 
            var flattenedStepValues = flattenedOldNewValues.map((zippedValues) => {
                var oldValue = zippedValues[0];
                var newValue = zippedValues[1];
                return calculateValueInRange(oldValue, newValue, animationPct);
            });

            // group flattened [R, G, B, R, G, B] values and back into [[R,G,B], [R,G,B]] arrays
            var stepValues = groupValuesIntoArrays(flattenedStepValues, 3);

            animatedValueFn(stepValues);

            currentStep += 1;
            if(currentStep < this.numSteps) {
                this.stepFnIdentifier = setTimeout(step, this.stepInterval);
            }
        }
        step();
    }
}
module.exports = Animator
