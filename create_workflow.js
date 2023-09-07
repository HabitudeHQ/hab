function(instance, properties, context) {

    try{
        console.log(`Starting [create_workflow]`);

        let workflow_payloads_template = [];
        
        if (properties.workflow_payloads_template) {

            try {
				workflow_payloads_template = JSON.parse(properties.workflow_payloads_template);
            }
            
            catch (err) {
                console.error(err);
            }
        } 

        let map = {
            "_p_habitID":properties.habit_id,
            "_p_version": properties.version,
            "_p_workflowPayloads": workflow_payloads_template,
            "_p_actions":[
            ]
        };

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
    catch(error){
        console.error(error.message);
    }
}