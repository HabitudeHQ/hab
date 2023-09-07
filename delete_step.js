function(instance, properties, context) {

    try{

        //main
        var map;
        if (!properties.direct) {
            map = JSON.parse(properties.map);
        }
        else if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }

        var steps = map._p_actions;

        var stepToDeleteIndex = steps.findIndex(function(step){
            return step._p_actionID === properties.deleted_step_id;
        });

        if (stepToDeleteIndex < 0) {
            //console.log(stepToDeleteIndex);
            //let Bubble layer know that it wasn't found
            return;
        }
        //console.log(stepToDeleteIndex)

        //we're creating an immutable store of the step to be deleted
        var stepToDelete = JSON.parse(JSON.stringify(steps[stepToDeleteIndex]));

        //and chopping that step out of the array of steps
        steps.splice(stepToDeleteIndex, 1);

        function compareNumbers(a, b) {
            return a - b;
        }
        
        steps.sort(compareNumbers);

        steps.forEach(function(step, index){

            //if this step had an actionIndex greater than the
            //step to be deleted then we're going to decrement that
            //down by 1

            if (step._p_actionIndex > stepToDelete._p_actionIndex && stepToDelete._p_actionIndex > 1) {
                step._p_actionIndex--;
                step._p_tested = false;
            };


            //if this step referenced the deleted step as its next step
            //then we're going to set it's nextStep to the nextStep of 
            //the step to delete

            if (step._p_nextStep === stepToDelete._p_actionID){
                
                //console.log("This step references the now deleted step as its next step")
                //console.log("Deleted step");
                //console.log(stepToDelete);
                //console.log();
                
                step._p_nextStep = stepToDelete._p_nextStep ? stepToDelete._p_nextStep : null;
                
                //console.log(`step._p_nextStep is now: ${step._p_nextStep}`);
            }

            //if this is the last step and it still has a nextStep ID then we're going to clear that out
            if (index === steps.length -1 && step._p_nextStep) step._p_nextStep = null;
        })

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

    }
    catch(err){
        console.error(err.message);
        instance.publishState("error",err.message);
        instance.triggerEvent("error",function(){});
        //send to Loggly
    }


}