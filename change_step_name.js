function(instance, properties, context) {

    console.log("Running rename");
    console.log(properties);


    // Test if no name or map is empty.
    try {
        if (!properties.name) {
            throw ("[change_step_name] No name provided")
        }
        
        // Parse JSON and assign actions to steps.
        var map;

        if (!properties.direct) {
            map = JSON.parse(properties.map);
        }
        else if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }

        var steps = map._p_actions;

        //find and make a clone of the step to rename
        var stepToUpdateIndex = steps.findIndex(function (step) {
            return step._p_actionID === properties.step_to_update_id;
        });
        
        //console.log("stepToUpdateIndex is ", stepToUpdateIndex);

        // If not found, return.
        if (stepToUpdateIndex < 0) {
            //console.log("Couldn't find the step to move");
            return;
        }

        // Grab the step to update
        var stepToUpdate = steps[stepToUpdateIndex];

        // Update name as necessary.
        stepToUpdate._p_name = properties.name;
        
        //console.log(JSON.stringify(map));

        // Publish map.
        if (!properties.direct) {
            instance.publishState("map_raw_stringified", JSON.stringify(map));
            instance.triggerEvent("save_map_raw", function (err) { });
        }
        
        else if (properties.direct) window.habitude.main.methods.publishAll();

        //console.log(JSON.stringify(map));
    }

    catch (err) {
        console.error(err.message);
        return
    }

}