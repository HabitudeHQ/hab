function(instance, properties, context) {

    try {

        var map;

        if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }

        else if (!properties.direct) {
            var map = JSON.parse(properties.existing_map);
        }

        let payloadParent;

        if (properties.action_id === "workflow") payloadParent = map._p_workflowPayloads;
        else {
            payloadParent = map._p_actions.find(action => { return action._p_actionID === properties.action_id; });
            if (!payloadParent) throw new Error(`When creating a new payload, did not find the _p_actionID ${properties.action_id}`);
            else payloadParent = payloadParent._p_payload;
        }

        ///////////////////////////////////////////////////////////
        //BUILD THE CONTENT OBJECT
        ///////////////////////////////////////////////////////////

        let content = {
            "_p_internalRef": properties.internal_ref,
            "_p_listText": [],
            "_p_listDate": [],
            "_p_listNumber": [],
            "_p_completed": properties.completed,
            "_p_ref": window.habitude.base.makeId(10)
        };

        const processValue = (value, map) => {

            if (!properties.translate_as_vector || properties.direct) return value;

            let responseValue;

            if (!Array.isArray(value)) responseValue = JSON.stringify(window.habitude.base.functions.vectoriseText(value))
            else responseValue = value.map((arrItem) => {
                return JSON.stringify(window.habitude.base.functions.vectoriseText(value));
            });

            if (properties.logging) console.log(`[window.habitude.base.update/processValue]\nabout to return value:\n${JSON.stringify(responseValue)}`);

            return responseValue;
        }

        if (properties.input_or_output) content._p_input_output = properties.input_or_output;
        if (properties.index) content._p_index = properties.index - 1;
        if (properties.external_ref) content._p_externalRef = properties.external_ref;
        if (properties.type) content._p_type = properties.type;
        if (properties.value_text) content._p_valueText = processValue(properties.value_text);
        if (properties.value_date) content._p_valueDate = properties.value_date;
        if (properties.value_number) content._p_valueNumber = properties.value_number;
        if (properties.bubble_obj) content._p_bubbleObj = properties.bubble_obj;

        if (!!properties.builder_ref) {
            content._p_builderRef = properties.builder_ref;
        }

        ///////////////////////////////////////////////////////////
        //MOVE THE NEW CONTENT OBJECT INTO THE MAP
        ///////////////////////////////////////////////////////////

        let payloadInd = -1;

        //get the index of any inputs / outputs within the payload that have the same index as the item being proposed
        if (content.index !== undefined && content.index > -1 && content.index !== null) {

            payloadInd = payloadParent.findIndex(function (payload) {
                return content._p_index === payload._p_index;
            });

        }

        if (properties.logging) console.log(`[create_payload] payloadInd is: ${payloadInd}`);

        //if none are found then add it in at the proposed location
        if (payloadInd === -1) {
            payloadParent.push(content);
        }

        //otherwise, swap out the found item for the new one
        else {
            payloadParent.splice(payloadInd, 1, content);
        };

        if (properties.do_save && !properties.direct) {
            instance.publishState("map_raw_stringified", JSON.stringify(map));
            instance.triggerEvent("save_map_raw", function (err) { });
        }
        
        if (properties.do_save && properties.direct) window.habitude.main.methods.publishAll();

    }

    catch (err) {
        console.error(err.message);
        instance.publishState("error", err.message);
        instance.triggerEvent("error", (e) => { });
    }
}