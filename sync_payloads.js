const sync = function(instance, properties, context) {

    var log = properties.logging;

    try {

        if (log) console.log(`[STARTING sync_payloads]\n\n- Properties\n${JSON.stringify(properties)}`);

        var map,model;

        if (!properties.direct) {
            map = JSON.parse(properties.map);
        }
        else if (properties.direct) {
            map = window.habitude.main.maps.partial;
        }

        model = JSON.parse(properties.model);

        var shouldProceed = !!map && !!model;

        if (log) console.log(`[sync_payloads]\nshouldProceed: ${shouldProceed}\ninstance.data.isNotEmpty(map): ${window.habitude.base.isNotEmpty(map)}\ninstance.data.isNotEmpty(model): ${window.habitude.base.isNotEmpty(model)}`);

        if (!shouldProceed) return;

        var data = {
            text_1: properties.text_1 ? properties.text_1.get(0, properties.text_1.length()) : null,
            text_2: properties.text_2 ? properties.text_2.get(0, properties.text_2.length()) : null,
            text_3: properties.text_3 ? properties.text_3.get(0, properties.text_3.length()) : null,
            text_4: properties.text_4 ? properties.text_4.get(0, properties.text_4.length()) : null,
            text_5: properties.text_5 ? properties.text_5.get(0, properties.text_5.length()) : null,
            text_6: properties.text_6 ? properties.text_6.get(0, properties.text_6.length()) : null,
            number_1: properties.number_1 ? properties.number_1.get(0, properties.number_1.length()) : null,
            number_2: properties.number_2 ? properties.number_2.get(0, properties.number_2.length()) : null,
            number_3: properties.number_3 ? properties.number_3.get(0, properties.number_3.length()) : null,
            boolean_1: properties.boolean_1 ? properties.boolean_1.get(0, properties.boolean_1.length()) : null,
            boolean_2: properties.boolean_2 ? properties.boolean_2.get(0, properties.boolean_2.length()) : null,
            length: properties.length
        };

        if (log) console.log(`[sync_payloads]\data: \n${JSON.stringify(data)}`);

        var error = '';
        var existingPayloadArr = [];

        var step = map._p_actions.find(step => { return step._p_actionID === properties.action_id; });
        if (!step) throw (`[sync_payloads] Did not find action (${properties.action_id}) in map`);

        if (!properties.is_runtime) {

            //filter payloads with the internalRef filter
            try {
                const model = JSON.parse(properties.model);
            }

            catch (err){
                throw Error("was not able to parse properties.model into an object");
            }
            

            existingPayloadArr = step._p_payload.filter(payload => {

                return payload._p_internalRef === properties.internal_ref_filter;

            });

            step._p_payload = step._p_payload.filter(payload => {

                return payload._p_internalRef !== properties.internal_ref_filter;

            });

            //run through every item in the data array
            //1. check whether there is already an externalRef with the id in it
            //
            //2. if there is then update the values on the payload
            //
            //3. if there is not then create a payload per the model and add it to the array


            data.text_1.forEach((item, index) => {

                let payloadToKeep = existingPayloadArr.find(payload => {

                    return payload[properties.lookup_field] === data[properties.lookup_value][index];

                });

                let wasNew = false;
                if (!payloadToKeep) {
                    wasNew = true;
                    
                    //create a new payload
                    payloadToKeep = JSON.parse(properties.model);
                    payloadToKeep._p_ref = window.habitude.base.makeId(10);
                    existingPayloadArr.push(payloadToKeep);
                }

                for (var key in model) {
     
                    if (data.hasOwnProperty(model[key])
                        && !!data[model[key]]
                        && data[model[key]].length
                        && data[model[key]].length > 0) {
                        payloadToKeep[key] = data[model[key]][index];
      
                    }
                }

                if (wasNew) console.log(payloadToKeep);

            });

            let finalPayloadArr = existingPayloadArr.filter(payload => {

                return data[properties.lookup_value].includes(payload[properties.lookup_field]);

            });

            step._p_payload = step._p_payload.concat(finalPayloadArr);

        }

        else if (properties.is_runtime) {

            for (var x = 0; x < data.length; x++) {

                var index;
                try {
                    index = step._p_payload.findIndex(
                        function (payload) {
                            return payload._p_internalRef === properties.internal_ref_filter && payload[properties.lookup_field] === data[properties.lookup_value][x];
                        });
                }
                catch (err) {
                    error += err
                };

                if (index === -1) continue;


                switch (step._p_payload[index]._p_type){
                    case "valueNumber":
                        var valueAsNumber = Number(data[properties.value_field][x]) !== "NaN" ? Number(data[properties.value_field][x]) : null;
                        step._p_payload[index]._p_valueNumber = valueAsNumber;
                        break;

                    case "valueDate":
                        step._p_payload[index]._p_valueDate = data[properties.value_field][x];
                        break;

                    case "listText":
                        var listItems = data[properties.value_field][x].split("|^^|");
                        step._p_payload[index]._p_listText = listItems;
                        break;

                    default:
                        step._p_payload[index]._p_valueText = data[properties.value_field][x];
                        break;
                                                      }


            }
        }

        if (properties.logging) {
            console.log(`[sync_payloads]\nAbout to publish states\n${JSON.stringify(map)}`);
        }

        var shouldPublishValues = window.habitude.base.isNotEmpty(map) && window.habitude.base.isNotEmpty(JSON.stringify(map)) && JSON.stringify(map) !== 'null';

        if (!shouldPublishValues) return;


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

    catch (err) {

        console.error(err);

        instance.publishState("error", err.message);
        instance.triggerEvent("error", function(error){});
    }
}