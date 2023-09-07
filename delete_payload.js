function(instance, properties, context) {

    try {
        let hspki;
        var map;

        if (!properties.direct) {
            map = JSON.parse(properties.map);
        }
        else if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }
        
        let payload_uid = properties.payload_id;
        var error = "";

        //console.log(`We're deleting... ${properties.deleted_step_id}`)

        //find the action within the array
        let actionInd = window.habitude.base.findStepIndex(map, properties.action_id, hspki);
        if (!actionInd.error) actionInd = actionInd.value;
        else error += "[" + actionInd.error + "] " + map + properties.action_id + "._p_actionID" + ".Deleting action";    

        //console.log(actionInd)  
        let payloadIndexInStepArr = window.habitude.base.findPayloadIndex(map, properties.payload_id, actionInd, hspki);  
        if (!payloadIndexInStepArr.error) payloadIndexInStepArr = payloadIndexInStepArr.value;
        else error += "[" + payloadIndexInStepArr.error + "] " + map + properties.payload_id + ".finding Payload Index inside Update Payload";
        //console.log(payloadIndexInStepArr)

        if (actionInd > -1 && payloadIndexInStepArr > -1){
            let payloadIndexKeyValue = map._p_actions[actionInd]._p_payload[payloadIndexInStepArr]._p_index;

            //publish the uid of the payload
            instance.publishState("payload_uid",payload_uid);

            //delete the payload
            map._p_actions[actionInd]._p_payload.splice(payloadIndexInStepArr,1);

            if (payloadIndexKeyValue !== -1){
                ////reduce the Index of any inputs / outputs that came after this Payload
                //create an array of the payloads that are either input / output and came after the deleted payload
                let res = map._p_actions[actionInd]._p_payload.filter(function(obj) {
                    return obj._p_index > payloadIndexKeyValue;
                });  

                if (res.length > 0){
                    res.forEach(function(obj){
                        var pos = map._p_actions[actionInd]._p_payload.findIndex(function(a){
                            return a._p_ref === obj._p_ref;
                        })

                        //subtract one from the payloads
                        var val = map._p_actions[actionInd]._p_payload[pos]._p_index - 1;
                        map._p_actions[actionInd]._p_payload[pos]._p_index = val;

                    })                   
                }
                //loop through each one, find their index in the array using their reference

            }

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


    }
    catch (err){
        console.error(err.message);
        instance.publishState("error",err.message);
        instance.triggerEvent("error",function(){});
        //send to Loggly
    }

}