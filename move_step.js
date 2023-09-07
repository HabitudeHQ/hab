function(instance, properties, context) {

    try {
        //main
        if (!properties.step_to_move || !properties.new_index || properties.new_index < 2) {
            throw `We failed to move step due to initial conditions!`
        };

        var map;

        if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }

        else if (!properties.direct) {
            map = JSON.parse(properties.existing_map);
        }

        var steps = map._p_actions;

        //find and make a clone of the step to move
        var stepToMoveIndex = steps.findIndex(function (step) {
            return step._p_actionID === properties.step_to_move;
        });

        if (stepToMoveIndex < 0) {
            //console.log("Couldn't find the step to move");
            return;
        }

        if (stepToMoveIndex === 0) {
            throw `Cannot move step 1`
            return
        }

        var stepToMove_clone = JSON.parse(JSON.stringify(steps[stepToMoveIndex]));
        var stepToMove = steps[stepToMoveIndex];

        var stepToShiftIndex = steps.findIndex(function (step) {
            return step._p_actionIndex === properties.new_index;
        });

        if (stepToShiftIndex < 0) stepToShift = null;
        else stepToShift = steps[stepToShiftIndex];
        var stepToShift_clone = JSON.parse(JSON.stringify(stepToShift));

        var upOrDown = stepToShift._p_actionIndex > stepToMove._p_actionIndex ? "up" : "down";
        //console.log(`${upOrDown}`);

        switch (upOrDown) {
            case 'up':
                console.log("Inside up");
                steps.forEach(function (step) {
                    if (step._p_actionIndex > stepToMove_clone._p_actionIndex && step._p_actionIndex <= stepToShift_clone._p_actionIndex) {
                        step._p_actionIndex--;
                    }
                });

                if (stepToShift_clone) stepToMove._p_actionIndex = stepToShift_clone._p_actionIndex - 1;
                else {
                    steps.sort((a, b) => a._p_actionIndex - b._p_actionIndex);
                    stepToMove._p_actionIndex = steps[steps.length - 1]._p_actionIndex + 1;
                }

            //chainSteps(steps);

            case 'down':
                steps.forEach(function (step) {
                    if (step._p_actionIndex >= stepToShift_clone._p_actionIndex && step._p_actionIndex < stepToMove_clone._p_actionIndex) {
                        step._p_actionIndex++;
                    }
                });

                stepToMove._p_actionIndex = stepToShift_clone._p_actionIndex;

            //console.log(JSON.stringify(steps));


        }

        //1. Index of moved step is set to new index
        //2. Make the step in the new position reference the next step of the step in old position
        stepToMove._p_actionIndex = stepToShift_clone._p_actionIndex;
        stepToMove._p_nextStep = stepToShift_clone._p_actionID;

        chainSteps(steps);

        //console.log(JSON.stringify(steps));

        if (!properties.direct) {
            instance.publishState("map_raw_stringified", JSON.stringify(map));
            instance.triggerEvent("save_map_raw", function (err) { });
        }
        else {
            window.habitude.main.methods.publishAll();
            window.habitude.base.convertPartialMapToFull(instance, properties);
            window.habitude.base.evaluateMap(instance, {
                direct: true
            });
        }

        function chainSteps(steps) {

            steps.sort((a, b) => a._p_actionIndex - b._p_actionIndex);
            var stepTwoIndex = steps.findIndex(function (step) {
                return step._p_actionIndex === 2;
            });
            var stepTwo = steps[stepTwoIndex];

            steps.forEach(function (step, stepIndex) {

                var nextStep = steps[stepIndex + 1];
                if (step._p_actionIndex === 1) {
                    step._p_nextStep = stepTwo._p_actionID;
                    return;
                }

                if (nextStep) {
                    step._p_nextStep = nextStep._p_actionID;
                }
                else {

                    step._p_nextStep = null;
                    //console.log("Just wiped nextStep");

                }
            });
        }
    } catch (err) {
        console.error(err.message);
        instance.publishState("error", err.message);
        instance.triggerEvent("error", function () { });
    }

}