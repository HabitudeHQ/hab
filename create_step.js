function(instance, properties, context) {

    try{
        
		console.log(`Starting [create_step]`);

        class step {
            constructor(behaviour, name, is_trigger, index, payloadTemplate, steps) {

                //console.log("Inside constructur");

                // Create variables.
                this._p_actionID = window.habitude.base.guid(4);
                this._p_behaviour = behaviour;
                this._p_name = name;
                this._p_is_trigger = is_trigger;
                this._p_tested = false;

                // Assign payload template.
                try {
                    if (payloadTemplate) {
                        var payload = JSON.parse(payloadTemplate);
                        this._p_payload = payload;
                    }
                    else this._p_payload = [];
                }
                catch (err) {
                    throw new Error(`[create_step] Hit issue parsing the payload template\n${payloadTemplate}`);
                }

                this.attachToHabit(steps, index);
            }

            attachToHabit(stepsInSequence, index) {

                //console.log("Inside attachToHabit");
                //console.log(arguments);

                if (stepsInSequence.length > 1) {
                    stepsInSequence = stepsInSequence.sort((a, b) => a._p_actionIndex - b._p_actionIndex);
                };

                if (stepsInSequence.length > 0) {
                    var finalStep = stepsInSequence[stepsInSequence.length - 1];

                    //this will be our return value
                    //if index is blank we'll set it to the last position, if not then we'll use the index provided

                    this._p_actionIndex = window.habitude.base.isEmpty(index) || index > finalStep._p_actionIndex
                        ? finalStep._p_actionIndex + 1 : index;
                }
                else {
                    this._p_actionIndex = !window.habitude.base.isEmpty(index) ? index : 1;
                }

                var that = this;

                stepsInSequence.push(this)

                //console.log(stepsInSequence);

                if (stepsInSequence.length > 1) {

                    stepsInSequence.forEach(function (step) {

                        //console.log(step);

                        if (step._p_actionIndex < that._p_actionIndex - 1) return;

                        if (step._p_actionIndex === that._p_actionIndex - 1) {
                            that._p_nextStep = step._p_nextStep;
                            step._p_nextStep = that._p_actionID;
                        };

                        if (step._p_actionIndex >= that._p_actionIndex && step._p_actionID !== that._p_actionID) {
                            step._p_actionIndex++;
                            step._p_tested = false;
                        };
                    });

                    stepsInSequence.sort((a, b) => a._p_actionIndex - b._p_actionIndex);
                }
            }

        };

        //main
        var behaviour = properties.behaviour;
        if (!behaviour) return;

        if (!properties.existing_map && !properties.direct) throw new Error(`[create_step] no map was provided`);
        if (!window.habitude.main.maps.partial && properties.direct) throw new Error(`[create_step] no partial map is available`);

        var map;
        if (!properties.direct) {
            map = JSON.parse(properties.map);
        }
        else if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }

        //console.log(map);

        var is_trigger = properties.is_trigger;
        var name = properties.name ? properties.name : behaviour;
        var index = properties.index;
        var payloadTemplate = properties.payload_template;

        var stepToAdd = new step(behaviour, name, is_trigger, index, payloadTemplate, map._p_actions);

        console.log(`about to save map from [create_step]`);
        console.log(JSON.stringify(map));
        
        

        if (!properties.direct) {
            instance.publishState("map_raw_stringified", JSON.stringify(map));
            instance.triggerEvent("save_map_raw", function (err) { });
        }
        
        else {
            window.habitude.main.methods.publishAll();
            window.habitude.base.evaluateMap(instance, {
                direct: true
            });
        }

    }
    catch(error){
        console.error(error.message);
        instance.publishState("error", error.message);
        instance.triggerEvent("error", (e)=>{});
    }

}