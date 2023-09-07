function(instance, context) {

    //CS FUNCTIONS ONLY
    //START
    {
        /*    
        instance.data.logCSA = function(data) {

            console.log(JSON.stringify(context));

            const logzioUrl 	= context.keys['logz.io URL']; //"https://listener-uk.logz.io";
            const logzioToken 	= context.keys['logz.io token']; //"GmUpKaQVvghvpSLsMYxzPhWNuYTNLwka";

            var options = {
                logzioUri: logzioUrl + "?token=" + logzioToken
            };

            window.Logzio.track(data, options);

        }
    */    

        instance.data.update = function(instance, properties, context, logging){

            let hspki;
            let start = new Date();

            var map = JSON.parse(properties.map);
            //var map = properties.map;
            var error = "";

            //search the chain for action and payload indexed
            let actionInd;
            let payloadInd;

            if (logging) console.log(`[instance.data.update]\nProperties\n${JSON.stringify(properties)}`);


            try {
                actionInd = instance.data.findStepIndex(map, properties.action_id, hspki);
                //console.log("actionInd: ", JSON.stringify(actionInd));
                if (!actionInd.error) actionInd = actionInd.value;
                else error += "[" + actionInd.error + "] " + map + properties.action_id + "._p_lookupID" + ".finding action Index inside Update Payload";

                if (!error) {
                    payloadInd = instance.data.findPayloadIndex(map, properties.payload_id, actionInd, hspki);
                    //console.log("payloadInd: ", JSON.stringify(payloadInd));
                    //console.log(payloadInd);
                    if (!payloadInd.error && payloadInd.value > -1) payloadInd = payloadInd.value;
                    else error += "[" + payloadInd.error + "] " + map + properties.payload_id + ".finding Payload Index inside Update Payload";   
                }


                if (!error){

                    //check if type override has been provided, otherwise revert to the pre-stored Type
                    var type;
                    if (instance.data.isNotEmpty(properties.type_override)){

                        if (properties.type_override === "default") {
                            type = "_p_" + map._p_actions[actionInd]._p_payload[payloadInd]._p_type;
                        } else type = "_p_" + properties.type_override;


                        if (type === "_p_valueText") {
                            map._p_actions[actionInd]._p_payload[payloadInd][type] = properties.value_text;
                        }

                        if (type === "_p_valueNumber") map._p_actions[actionInd]._p_payload[payloadInd][type] = properties.value_number;

                        if (type === "_p_valueDate") {

                            map._p_actions[actionInd]._p_payload[payloadInd][type] = String(properties.value_date);
                        }

                        if (type === "_p_listText") {
                            var list = properties.value_text_list.get(0, properties.value_text_list.length());

                            map._p_actions[actionInd]._p_payload[payloadInd][type] = list;
                        }

                        if (type === "_p_listDate") {
                            var list = properties.value_text_list.get(0, properties.value_date_list.length());

                            for (var x = 0; x < list.length; x++) {
                                list[x] = String(list[x]);
                            }

                            map._p_actions[actionInd]._p_payload[payloadInd][type] = list;
                        }

                        if (type === "_p_listNumber") {
                            var list = properties.value_text_list.get(0, properties.value_number_list.length());

                            map._p_actions[actionInd]._p_payload[payloadInd][type] = list;
                        }


                        if (type === "_p_completed") {

                            map._p_actions[actionInd]._p_payload[payloadInd][type] = properties.completed;
                        }

                        if (type === "_p_externalRef") {

                            map._p_actions[actionInd]._p_payload[payloadInd][type] = properties.external_ref;
                        }

                    }

                    else {


                        if (instance.data.isNotEmpty(properties.value_text)) {

                            if (properties.value_text === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_valueText = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_valueText = properties.value_text;

                        }

                        if (instance.data.isNotEmpty(properties.internal_ref)) {

                            if (properties.internal_ref === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_internalRef = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_internalRef = properties.internal_ref;

                        }

                        if (instance.data.isNotEmpty(properties.value_number)) {

                            if (properties.value_number === -999999) map._p_actions[actionInd]._p_payload[payloadInd]._p_valueNumber = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_valueNumber = properties.value_number;

                        } 

                        if (instance.data.isNotEmpty(properties.value_date)) {

                            if (properties.value_date === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_valueDate = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_valueDate = properties.value_date;

                        }


                        if (instance.data.isNotEmpty(properties.completed)) {

                            map._p_actions[actionInd]._p_payload[payloadInd]._p_completed = properties.completed;
                        }

                        if (instance.data.isNotEmpty(properties.external_ref)) {

                            //wipe the key's value if it's ***/1/***
                            if (properties.external_ref === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_externalRef = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_externalRef = properties.external_ref;
                        }

                        if (instance.data.isNotEmpty(properties.builder_ref)) {

                            if (properties.builder_ref === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_builderRef = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_builderRef = map._p_actions[actionInd]._p_payload[payloadInd]._p_ref + "/" + properties.builder_ref;

                        }

                        if (instance.data.isNotEmpty(properties.type)) {

                            if (properties.type === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_type = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_type = properties.type;

                        }

                        if (instance.data.isNotEmpty(properties.bubble_obj)) {

                            if (properties.bubble_obj === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_bubbleObj = null;
                            else map._p_actions[actionInd]._p_payload[payloadInd]._p_bubbleObj = properties.bubble_obj;

                        }

                        //handle lists
                        try {
                            if (properties.value_text_list && properties.value_text_list.get) {
                                var list = properties.value_text_list.get(0, properties.value_text_list.length());

                                if (list[0] === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_listText = [];
                                else map._p_actions[actionInd]._p_payload[payloadInd]._p_listText = list;
                            }

                            if (properties.value_date_list && properties.value_date_list.get) {
                                var list = properties.value_date_list.get(0, properties.value_date_list.length());

                                if (list[0] === "***||1||***") map._p_actions[actionInd]._p_payload[payloadInd]._p_listDate = [];
                                else map._p_actions[actionInd]._p_payload[payloadInd]._p_listDate = list;
                            }

                            if (properties.value_number_list && properties.value_number_list.get) {
                                var list = properties.value_number_list.get(0, properties.value_number_list.length());

                                if (list[0] === -999999) map._p_actions[actionInd]._p_payload[payloadInd]._p_listNumber = [];
                                else map._p_actions[actionInd]._p_payload[payloadInd]._p_listNumber = list;
                            }

                        }

                        catch (err){
                            
                            console.error(err);
                            
                            error += "Hit error adding an array whilst updating a payload. [Habit: " + map._p_habitID + "]"+ ". Error message is [" + err.message + "].  ";
                            instance.data.sendLogglyError("error", null , `Unhandled error updating a payload on client. Hit an issue when updating list fields\n[ERROR MESSAGE]\n${JSON.stringify(err.message)}\n[ERROR STACK]\n${JSON.stringify(err.stack)}\n[ARGUMENTS]\n(instance, properties, context, logging)\n${JSON.stringify(arguments)}`, ['csa','instance.data.update','initialize','habitude-main']);
                            instance.publishState("error", err);
                            instance.triggerEvent("error", function(e){});
                        }

                    }
                    
                    if (logging) console.log(`[instance.data.update]\about to publish map\n\n${JSON.stringify(map)}`);

                    instance.publishState("map_raw_stringified", JSON.stringify(map));
                    instance.triggerEvent("save_map", function(err) {});

                } 

                else {

                    var error = "Ran into error with Habit " + map._p_habitID + "whilst trying to update a payload.";

                    if (actionInd === -1) {
                        error += "Could not find the action (" + properties.action + ") within the habit.";
                    } else if (payloadInd === -1){
                        error += "Could not find the payload (" + properties.payload + ") within the action (" + properties.action + ").";
                    }

                    instance.publishState("error",error);
                    instance.triggerEvent("error",function(e){});

                }

                let end = new Date();
                instance.data.log("Ended update_payload", "Elapsed time ms is: " + (end.getTime() - start.getTime()));

            }
            catch (err){

                console.error("Hit error when updating a payload during the location of the action & habit. [Habit: " + map._p_habitID + "]"+ ". Error message is [" + err + "].  ");

                error += "Hit error when updating a payload during the location of the action & habit. [Habit: " + map._p_habitID + "]"+ ". Error message is [" + err + "].  ";
                instance.data.sendLogglyError("error", null , `Unhandled error updating a payload on client. Couldn't find either the step or the payload\n[ERROR MESSAGE]\n${JSON.stringify(err.message)}\n[ERROR STACK]\n${JSON.stringify(err.stack)}\n[ARGUMENTS]\n(instance, properties, context, logging)\n${JSON.stringify(arguments)}`, ['csa','instance.data.update','initialize','habitude-main']);

                instance.publishState("error", err);
                instance.triggerEvent("error", function(e){});
            }
        };
        
        instance.data.create_vector_for_tag = function (instance, properties, context){
            try {

                let start = new Date();

                var map = JSON.parse(properties.map);
                var error;


                var output_values = [];
                var output_keys = [];

                if (properties.text_list) {
                    var arr = properties.text_list.get(0, properties.text_list.length());

                    arr.forEach(function (item, index) {
                        if (item) {
                            output_values.push(processText(item, map));
                        }
                        else {
                            output_values.push('');
                        }
                    });

                }

                else if (properties.text.length > 0) {

                    properties.text.forEach(function (item, index) {
                        output_keys.push(item.key);
                        if (instance.data.isEmpty(item.value)) output_values.push("");
                        else output_values.push(processText(item.value, map));
                    });

                }

                instance.publishState("dynamic_payload_keys", output_keys);
                instance.publishState("dynamic_payload_values", output_values);
                //instance.publishState("custom_method", "vector");
                //instance.triggerEvent("custom_event", function(err){});

                function processText(body, map) {

                    //console.log("About to process");
                    //console.log(body);
                    //console.log();

                    //collect all of the tags into an array
                    var textSplitByTags = instance.data.isNotEmpty(body) ? body.match(/{{.*?\}}/g) : null;
                    //console.log("Split up for processing");
                    //console.log(textSplitByTags);

                    var toBeProcessed = body;
                    var beenProcessed = []; //everything will be pushed from a across to b

                    if (textSplitByTags === null) {
                        if (instance.data.isNotEmpty(toBeProcessed)) beenProcessed.push(toBeProcessed);
                        else beenProcessed.push("");
                        return JSON.stringify(beenProcessed);
                    }

                    for (var thisSplitIndex = 0; thisSplitIndex < textSplitByTags.length; thisSplitIndex++) {

                        //console.log("a is ", beenProcessed);
                        //console.log("being processed is ", textSplitByTags[thisSplitIndex]);

                        //console.log("toBeProcessed.substring(0, toBeProcessed.indexOf(textSplitByTags[x]) - 2) is ", toBeProcessed.substring(0, toBeProcessed.indexOf(textSplitByTags[thisSplitIndex])));

                        //push all vanilla text left of the tag from toBeProcessed into beenProcessed
                        var indexOfThisTagStart = toBeProcessed.indexOf(textSplitByTags[thisSplitIndex]);
                        var textLeftOfTag = toBeProcessed.substring(0, indexOfThisTagStart);
                        if (textLeftOfTag !== "") {
                            beenProcessed.push(textLeftOfTag);
                        }

                        //console.log("toBeProcessed.substring(toBeProcessed.indexOf(textSplitByTags[x]), toBeProcessed.length) is ", toBeProcessed.substring(toBeProcessed.indexOf(textSplitByTags[thisSplitIndex]), toBeProcessed.length));
                        //remove everything left of the text from toBeProcessed
                        toBeProcessed = toBeProcessed.substring(indexOfThisTagStart, toBeProcessed.length);

                        //push the tag from b into a
                        if (textSplitByTags[thisSplitIndex]) {
                            var tag = textSplitByTags[thisSplitIndex].replaceAll('{{', '').replaceAll('}}', '')
                            var tagSplit = tag.split('/');
                            var tagType = tagSplit[6];
                            var returnObj;

                            //tag types are:
                            //   - t: a merge tag, a reference to another piece of data stored elsewhere in the process
                            //   - a: attribute tag, a reference to a piece of live or global context brought in from runtime
                            //   - c: contact tag, a reference to a contact within the tenancy

                            switch (tagType){

                                case 'a': 
                                    //currently running attributes through the same function as merge tags
                                    //there's probably a case to do this differently in the future

                                case 't':
                                    returnObj = createMergeTag(tag, map);
                                    break;

                                case 'c':
                                    //console.log(`About to createContactTag with ${tag}`);
                                    returnObj = createContactTag(tag);
                                    //console.log(`\nreturnObject is:\n${JSON.stringify(returnObj)}`);
                                    break;

                                case 'x':
                                    returnObj = createCustomText(tag);
                                    break;

                                default:
                                    returnObj = "";
                                    break;
                                           }

                            beenProcessed.push(returnObj);
                            //console.log(`beenProcessed array is now:\n${JSON.stringify(beenProcessed)}`);
                        }

                        //remove magic text from b
                        toBeProcessed = toBeProcessed.substring(textSplitByTags[thisSplitIndex].length, toBeProcessed.length);

                        //if it's the last run then dump the last bit of b across into a
                        if (thisSplitIndex === (textSplitByTags.length - 1)) {
                            if (toBeProcessed !== "") {
                                beenProcessed.push(toBeProcessed);
                            }
                        }
                    }
                    return JSON.stringify(beenProcessed);
                };

                function createMergeTag(toFind, map) {

                    //loop through actions
                    var found = false;
                    var expressionSplit = toFind.split('/');

                    //mergeTag syntax is '{{reference / editor message / step index / list index / transformation / parameter / tag type}}';
                    var reference = expressionSplit[0] ? expressionSplit[0] : null;
                    var editorMessage = expressionSplit[1] ? expressionSplit[1] : null;
                    var stepIndex = expressionSplit[2] ? expressionSplit[2] : null;
                    var listIndex = expressionSplit[3] ? expressionSplit[3] : null;
                    var transformation = expressionSplit[4] ? expressionSplit[4] : null;
                    var parameter = expressionSplit[5] ? expressionSplit[5] : null;
                    var tagType = expressionSplit[6] ? expressionSplit[6] : null;

                    //if this is not an attribute then go find the lookup within the map
                    if (tagType === 't') {

                        var thisAction;
                        var thisPayload;

                        for (var actionIndex = 0; actionIndex < map._p_actions.length; actionIndex++) {

                            thisAction = map._p_actions[actionIndex];
                            //loop through outputs
                            for (var payloadIndex = 0; payloadIndex < thisAction._p_payload.length; payloadIndex++) {

                                thisPayload = thisAction._p_payload[payloadIndex];
                                if (thisPayload._p_builderRef && toFind) {

                                    if (thisPayload._p_builderRef.split('/')[0] !== toFind.split('/')[0]) continue;

                                    found = true;

                                    return {
                                        function: "lookup_single",
                                        version: "1",
                                        params: {
                                            text: toFind,
                                            actionRef: thisAction._p_lookupID,
                                            payloadRef: thisPayload._p_ref,
                                            type: thisPayload._p_type,
                                            listIndex: listIndex,
                                            transformation: transformation,
                                            parameter: parameter,
                                            editorReference: editorMessage,
                                            stepIndex: thisAction._p_actionIndex
                                        }
                                    };
                                }

                            }

                            if (found) break;

                            if (actionIndex == (map._p_actions.length - 1)) {

                                instance.publishState("error", "ERROR: [create dynamic payload] Never found " + properties.text + " within Habit [" + map._p_habitID + "].\n" + JSON.stringify(map));
                                instance.triggerEvent("error", function (err) { });

                                return {
                                    function: "lookup_single",
                                    version: "1",
                                    params: {
                                        text: toFind,
                                        actionRef: null,
                                        payloadRef: null,
                                        type: null,
                                        listIndex: listIndex,
                                        transformation: transformation,
                                        parameter: parameter,
                                        editorReference: editorMessage,
                                        stepIndex: stepIndex
                                    }
                                };
                            }

                        }
                    }

                    else if (tagType === 'a') {

                        if (toFind) {
                            //console.log("Inside attribute hunt\nAttributes library is\n",instance.data.attributes.library);
                            var ind = instance.data.attributes.library.findIndex(atr => atr.reference === expressionSplit[0].replaceAll('#', ''));
                            if (ind > -1) {
                                return {
                                    function: "lookup_single",
                                    version: "1",
                                    params: {
                                        text: toFind,
                                        actionRef: "#",
                                        payloadRef: instance.data.attributes.library[ind].reference,
                                        type: instance.data.attributes.library[ind].type,
                                        listIndex: listIndex,
                                        transformation: transformation,
                                        parameter: parameter,
                                        editorReference: editorMessage,
                                        stepIndex: "#"
                                    }
                                };
                            }
                            else {

                                instance.publishState("error", "ERROR: [create dynamic payload] Never found attribute " + toFind + " within Habit [" + instance.data.attributes.library + "]. \n" + JSON.stringify(map));

                                return {
                                    function: "lookup_single",
                                    version: "1",
                                    params: {
                                        text: toFind,
                                        actionRef: null,
                                        payloadRef: null,
                                        type: null,
                                        listIndex: listIndex,
                                        transformation: transformation,
                                        parameter: parameter,
                                        editorReference: editorMessage,
                                        stepIndex: stepIndex
                                    }
                                };
                            }
                        }


                    }

                };

                function createContactTag(tag){

                    // {{ email / editor text / @ / name / uid / lookup / tag}}
                    // {{izzi@habitude.co/I Dorrian/@/Izzi|^^|Dorrian/12345_54321/email/c}}
                    var tagSplit = tag.split('/');

                    var email = tagSplit[0] ? tagSplit[0] : null;
                    var name = tagSplit[3] ? tagSplit[3] : null;
                    var uid = tagSplit[4] ? tagSplit[4] : null;
                    var lookupKey = tagSplit[5] ? tagSplit[5] : null;

                    return {
                        function: 'lookup_contact',
                        version: "1",
                        params: {
                            text: tag,
                            email: email,
                            name: name,
                            uid: uid,
                            lookupKey: lookupKey
                        }
                    };
                };

                function createCustomText(tag){

                    // {{ null / custom text / symbol / type / null / null / tag}}
                    // {{izzi@habitude.co/I Dorrian/@/Izzi|^^|Dorrian/12345_54321/email/c}}
                    var tagSplit = tag.split('/');

                    var customText = tagSplit[1] ? tagSplit[1].replaceAll('&#47;','/').replaceAll('&#34;', '\"'): null;
                    var type = tagSplit[3] ? tagSplit[3] : null;

                    var symbol;
                    switch (type){
                        case 'email':
                            symbol = '@';
                            break;

                        default:
                            symbol = 'null';
                            break;
                                };

                    tag = `null/${tagSplit[1]}/${symbol}/${type}/null/null/x`;

                    return {
                        function: 'lookup_custom',
                        version: "1",
                        params: {
                            text: tag,
                            customText: customText,
                            type: type
                        }
                    }
                };


                let end = new Date();
                instance.data.log("Ended create_vector_for_tag", "Elapsed time ms is: " + (end.getTime() - start.getTime()));
            }

            catch (err){
                instance.data.sendLogglyError("error", null , `Unhandled error creating a vector tag.\n[ERROR MESSAGE]\n${JSON.stringify(err.message)}\n[ERROR STACK]\n${JSON.stringify(err.stack)}\n[ARGUMENTS]\n(instance, properties, context)\n${JSON.stringify(arguments)}`, ['csa','instance.data.create_vector_for_tag','initialize','habitude-main']);
                instance.publishState("error", JSON.stringify(err));
                instance.triggerEvent("error", function(err){});
                //do something useful here like send to Loggly
            }
        }
        instance.data.build_json_packet = function(instance, properties, context){
            /*
            properties = {
            	logging: boolean
                function: String
                provider_name: String
                action: String
                provider_category: String
                valueText: Array of {key, value}
                valueNumber: Array of {key, value}
                valueDate: Array of {key, value}
                listText: Array of {key, value}
                listNumber: Array of {key, value}
                listDate: Array of {key, value}
                existing_json: String
                key_dictionary: List of Strings
                use_dictionary: Boolean
                dictionary_index: Number
                isStringified: Boolean
                vectorise: Boolean
            }

            */
            var error;

            try {

                var key;
                var array = [];
                var obj = {};
                var obj_partial = {};
                var value;
                var dictionary_index;

                if (properties.existing_json) {
                    try {
                        obj = JSON.parse(properties.existing_json);
                    }

                    catch (err){
                        console.log(`Hit error parsing properties.existing_json`);
                    }
                }

                try {
                    //check if we're using key_dictionary, and fetch it if so
                    if (properties.use_dictionary && properties.dictionary_index > -1 && properties.key_dictionary.length() > 0) {
                        properties.use_dictionary = true;
                        instance.data.key_dictionary = properties.key_dictionary.get(0, properties.key_dictionary.length());
                    }
                    else {
                        properties.use_dictionary = false;
                    }
                }

                catch (err) {
                    properties.use_dictionary = false;
                }


                //**FUNCTION**//
                //a function key / value as been provided
                if (instance.data.isNotEmpty(properties.function)) obj.function = properties.function;

                //if there's no `function` key on the object then we're going to add a blank one
                else if (instance.data.isEmpty(obj.function)) obj.function = null;

                else {
                    //here, there was no `function` key / value given, but there was one pre-exisitng - so we're going to leave that be
                }

                //**PARAMS**//
                //check to see if `params` object has been defined yet, if not, then add it
                if (obj.params === undefined) obj.params = {};
                else {
                    //in all other scenarios we're going to leave it be
                }

                //**PARAMS.provider_name**//
                //a `provider_name` key / value as been provided
                if (instance.data.isNotEmpty(properties.provider_name)) obj.params.provider_name = properties.provider_name;

                //if there's no `provider_name` key on the object then we're going to add a blank one
                else if (instance.data.isEmpty(obj.params.provider_name)) obj.params.provider_name = null;

                else {
                    //here, there was no `provider_name` key / value given, but there was one pre-exisitng - so we're going to leave that be
                }

                //**PARAMS.action**//
                //a `action` key / value as been provided
                if (instance.data.isNotEmpty(properties.action)) obj.params.action = properties.action;

                //if there's no `action` key on the object then we're going to add a blank one
                else if (instance.data.isEmpty(obj.params.action)) obj.params.action = null;

                else {
                    //here, there was no `action` key / value given, but there was one pre-exisitng - so we're going to leave that be
                }

                //**PARAMS.provider_category**//
                //a `provider_category` key / value as been provided
                if (instance.data.isNotEmpty(properties.provider_category)) obj.params.provider_category = properties.provider_category;

                //if there's no `provider_category` key on the object then we're going to add a blank one
                else if (instance.data.isEmpty(obj.params.provider_category)) obj.params.provider_category = null;

                else {
                    //here, there was no `provider_category` key / value given, but there was one pre-exisitng - so we're going to leave that be
                }

                //**DATA**//
                //check to see if `data` object has been defined yet, if not, then add it
                if (obj.params.data === undefined) obj.params.data = {};
                else {
                    //in all other scenarios we're going to leave it be
                }

                if (properties.valueText.length > 0) {

                    properties.valueText.forEach(function(item, index){
                        //if data has been provided against the key, we'll use that
                        key = instance.data.getKey(item.key, properties.use_dictionary, instance.data.key_dictionary, properties.dictionary_index);
                        //("Key is: ", key);

                        if (instance.data.isNotEmpty(item.value)) {

                            obj.params.data[key] = instance.data.prepareValue(item.value, properties.isStringified);

                            if (properties.vectorise) {
                                obj.params.data[key] = instance.data.functions.vectoriseText(obj.params.data[key], properties.map);
                            }
                        }

                        //if there is no key created yet, then we'll create it & set it to null
                        else if (obj.params.data[item.key] === undefined) {

                            obj.params.data[key] = null;
                        }

                        else if (instance.data.isEmpty(item.value) && instance.data.isNotEmpty(obj.params.data[key])) {
                            obj.params.data[key] = null;
                        }

                        else {
                            //we'll just leave it be - there must be something already in here
                        }
                    });
                }


                if (properties.valueDate.length > 0) {

                    properties.valueDate.forEach(function(item, index){

                        key = instance.data.getKey(item.key, properties.use_dictionary, instance.data.key_dictionary, properties.dictionary_index);

                        if (instance.data.isNotEmpty(item.value)) {
                            obj.params.data[key] = instance.data.prepareValue(item.value, properties.isStringified);
                        }

                        //if there is no key created yet, then we'll create it & set it to null
                        else if (obj.params.data[key] === undefined) {
                            obj.params.data[key] = null;
                        }

                        else if (instance.data.isEmpty(item.value) && instance.data.isNotEmpty(obj.params.data[key])) {
                            obj.params.data[key] = null;
                        }

                        else {
                            //we'll just leave it be - there must be something already in here
                        }
                    });
                }

                if (properties.valueNumber.length > 0) {

                    properties.valueNumber.forEach(function(item, index){

                        key = instance.data.getKey(item.key, properties.use_dictionary, instance.data.key_dictionary, properties.dictionary_index);

                        if (instance.data.isNotEmpty(item.value)) {
                            var number = isNaN(Number(item.value)) || instance.data.isEmpty(item.value) ? null : Number(item.value);
                            obj.params.data[key] = number;
                        }
                        else if (obj.params.data[key] === undefined) {
                            obj.params.data[key] = null;
                        }

                        else if (instance.data.isEmpty(item.value) && instance.data.isNotEmpty(obj.params.data[key])) {
                            obj.params.data[key] = null;
                        }

                        else {
                            //we'll just leave it be - there must be something already in here
                        }
                    });
                }

                if (properties.listText.length > 0) {

                    properties.listText.forEach(function(item, index){

                        key = instance.data.getKey(item.key, properties.use_dictionary, instance.data.key_dictionary, properties.dictionary_index);

                        if (instance.data.isNotEmpty(item.value)) {
                            array = item.value.split('|^^|');

                            var arrayPrepared = array.map(itemValue => instance.data.prepareValue(itemValue, properties.isStringified));

                            //because rendering resolves arrays to strings, we need to nest actual arrays inside another array.
                            arrayPrepared.forEach(function(item, index){
                                var itemForArray;
                                if (properties.vectorise) itemForArray = instance.data.functions.vectoriseText(item, properties.map);
                                else itemForArray = item;
                                if (Array.isArray(itemForArray)) arrayPrepared[index] = itemForArray;
                                else arrayPrepared[index] = [itemForArray];
                            });

                            //console.log(arrayPrepared);

                            obj.params.data[key] = arrayPrepared;

                        }

                        //we've been provided a blank value and this is the first time we've seen this key - so we'll just create the key
                        else if (obj.params.data[key] === undefined){
                            obj.params.data[key] = [];
                        }

                        //there's a value already in the object but now we're receiving a blank - we're going to clear out that existing value
                        else if (instance.data.isEmpty(item.value) && instance.data.isNotEmpty(obj.params.data[key])) {
                            obj.params.data[key] = [];
                        }

                        else {
                            //we'll just leave it be - there must be something already in here
                        }
                    });
                }

                if (properties.listDate.length > 0) {

                    properties.listDate.forEach(function(item, index){

                        key = instance.data.getKey(item.key, properties.use_dictionary, instance.data.key_dictionary, properties.dictionary_index);

                        if (instance.data.isNotEmpty(item.value)) {
                            array = item.value.split('|^^|');
                            var arrayPrepared = array.map(itemValue => instance.data.prepareValue(itemValue, properties.isStringified));

                            //console.log(`Key is ${key}`);
                            //console.log("List of texts is\n",arrayPrepared);
                            obj.params.data[key] = arrayPrepared;
                            //console.log(obj.params.data[key]);

                        }

                        else if (obj.params.data[key] === undefined) {
                            obj.params.data[key] = [];
                        }

                        //there's a value already in the object but now we're receiving a blank - we're going to clear out that existing value
                        else if (instance.data.isEmpty(item.value) && instance.data.isNotEmpty(obj.params.data[key])) {
                            obj.params.data[key] = [];
                        }

                        else {
                            //we'll just leave it be - there must be something already in here
                        }

                    });
                }

                if (properties.listNumber.length > 0) {

                    properties.listNumber.forEach(function(item, index){

                        key = instance.data.getKey(item.key, properties.use_dictionary, instance.data.key_dictionary, properties.dictionary_index);

                        if (instance.data.isNotEmpty(item.value)) {
                            array = item.value.split('|^^|');
                            array.forEach(function(maybeNumber,index){
                                var cleanNumber = isNaN(Number(maybeNumber)) || instance.data.isEmpty(maybeNumber) ? null : Number(maybeNumber);
                                array[index] = cleanNumber;
                            });
                            obj.params.data[key] = array;           
                        }
                        else if (obj.params.data[key] === undefined){
                            obj.params.data[key] = [];
                        }

                        //there's a value already in the object but now we're receiving a blank - we're going to clear out that existing value
                        else if (instance.data.isEmpty(item.value) && instance.data.isNotEmpty(obj.params.data[key])) {
                            obj.params.data[key] = [];
                        }

                        else {
                            //we'll just leave it be - there must be something already in here
                        }

                    });
                }

                //console.log(obj);
                //console.log(JSON.stringify(obj));

                /*
                if (properties.vectorise){

                    if (obj.params.data) {
                        obj.params.data = handleData(obj.params.data);
                    }

                    function handleData (obj){
                        for (var key in obj) {
                            var value = obj[key];
                            var type = typeof obj[key];
                            var isArray = Array.isArray(value);
                            console.log(`Value is ${value}, type is ${type}`);

                            switch (type) {
                                case 'object':
                                    if (!isArray) break;
                                    obj[key].forEach(function(item, index) {
                                        var arrItemType = typeof item;
                                        console.log("About to send array item to function");
                                        if (arrItemType === 'string') obj[key][index] = instance.data.functions.vectoriseText(item, properties.map);
                                    });
                                    break;

                                case 'string':
                                    obj[key] = instance.data.functions.vectoriseText(value, properties.map);
                                    break;
                                        }
                        }

                        return obj;
                    }
                }
                */

                //console.log("Object\n",JSON.stringify(obj));

                return {
                    jsonPacket: JSON.stringify(obj),
                    error: error
                }

                //instance.publishState("JSONpackage", JSON.stringify(obj));
                //instance.triggerEvent("json_package_available", function(err){});
            }

            catch(err){

                instance.data.sendLogglyError("error", null , `Unhandled error building a JSON packet.\n[ERROR MESSAGE]\n${JSON.stringify(err.message)}\n[ERROR STACK]\n${JSON.stringify(err.stack)}\n[ARGUMENTS]\n(instance, properties, context)\n${JSON.stringify(arguments)}`, ['csa','instance.data.build_json_packet','initialize','habitude-main']);

                //console.log("Inside catch");
                //console.log(err);

                return {
                    jsonPacket: null,
                    error: JSON.stringify(err)
                }
            }

        }

    }
    //END

    //COPY / PASTE STANDARD FUNCTIONS LIBRARY HERE
    //START
    {

        // generally defaults to off 
        instance.data.consoleLogging = false;

        /** 
         * LS I expect these will be reused and refactored a lot to give deep insight and trend with loggly
         * DEBUG So log messages can be consistently formError message isated and optionally sent to Loggly
         */

        instance.data.getKey = function(item_key, use_dictionary, key_dictionary, dictionary_index) {
            var key;
            if (use_dictionary && key_dictionary && dictionary_index > -1) {
                //account for the fact that Bubble uses base 1 not base 0 for indexing
                key = key_dictionary[dictionary_index - 1];
            }

            else {
                key = item_key;
            }

            return key;
        }

        instance.data.prepareValue = function (value, isStringified) {

            //if (!isStringified) return value;

            var forReturn;
            try {
                forReturn = JSON.parse(value);
            }
            catch (err){
                forReturn = value;
            }

            return forReturn;
        }

        instance.data.log = function (s1, s2) {
            let message;
            if (instance.data.consoleLogging) {
                message = (new Date().getTime() + "").padEnd(16);
                if (s1) { message += (s1 + "").padEnd(60) }
                if (s2) { message += (s2 + "").padEnd(30) }
                console.log(message);
            }

            // TODO - also pump off messages to loggly - with elapsed time so we can monitor degradation
            // Want to be able to manage  console & loggly separately

        }

        instance.data.arraysEqual = function(a, b) {
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length !== b.length) return false;

            a.sort(function(a,b) {
                return a - b;
            });

            b.sort(function(a,b) {
                return a - b;
            });


            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }

        instance.data.warn = function (s1, s2) {
            let message;
            if (instance.data.consoleLogging) {
                message = (new Date().getTime() + "").padEnd(16);
                if (s1) { message += (s1 + "").padEnd(60) }
                if (s2) { message += (s2 + "").padEnd(30) }
                console.warn(message);
            }

            // TODO - also pump off messages to loggly

        }

        instance.data.isEmpty = function (property) {
            //Simple function to check if a value is empty or not - differs from ! because 0 will not show as empty using this

            if (property === '' || property === null || property === undefined) return true;
            else return false;
        }

        instance.data.isNotEmpty = function (property) {
            //as above, but the opposite

            if (property === '' || property === null || property === undefined) return false;
            else return true;
        }

        instance.data.makeId = function (length) {
            //returns a UID of n length
            var result = [];
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
            }
            return result.join('');
        };

        instance.data.scrambleIds = function (action) {
            //used when payload template JSON is added into a Habit to randomise the _p_ref of that payload to make sure there are no clashes with other payloads

            action._p_payload.forEach((payload, p_ind) => {

                action._p_payload[p_ind]._p_ref = instance.data.makeId(10);
                if (action._p_payload[p_ind]._p_builderRef) {

                    var builderRefSplit = action._p_payload[p_ind]._p_builderRef.split("/");

                    action._p_payload[p_ind]._p_builderRef = builderRefSplit.length > 1 ?
                        action._p_payload[p_ind]._p_ref + "/" + builderRefSplit[1] :
                    action._p_payload[p_ind]._p_ref + "/" + builderRefSplit[0] ;

                }
            });

            return action;

        }

        instance.data.findStepIndex = function (map, stepId, hspki) {
            //when given a habit (map) and a step ID (stepId), this function finds the index position of that step within the array of steps

            var error = "";
            var index;
            var found = false;

            var keyCandidates = ["_p_actionID", "_p_lookupID"];

            keyCandidates.forEach(function (key) {

                if (found) return;
                try {
                    index = map._p_actions.findIndex(
                        function (action) {
                            return action[key] === stepId
                        });
                    if (index > -1) found = true;
                }
                catch (err) {
                    error += err
                };

            })

            if (index < 0) {
                error = "[" + hspki + "] " + "could not find action [" + stepId + "] in " + map._p_habitID;
                instance.data.sendLogglyError("issue", hspki , `Didn't find Step Id [${stepId}] inside Habit [${map._p_habitID}]`, ['csa','instance.data.findStepIndex','initialize','habitude-main']);
            }

            return {
                value: index,
                error: error
            };

        }

        instance.data.findPayloadIndex = function (map, payloadRef, actionIndex, hspki) {
            //when given an action (via its index) and a payload reference (payloadRef), this function finds the index position of that payload within the payload array

            var warning = "";
            var index, error;

            try {
                index = map._p_actions[actionIndex]._p_payload.findIndex(
                    function (payload) {
                        return payload._p_ref === payloadRef;
                    });
            }
            catch (err) {
                // LS TODO throw?????? We otherwise are swallowing this error :-( 
                error += err
            };


            if (index < 0) {
                warning = "[" + hspki + "] " + "could not find payload [" + payloadRef + "] in " + map._p_habitID + " action [" + actionIndex + "]";

                instance.data.sendLogglyError("issue", hspki , `Didn't find the Payload [${payloadRef}] that was being requested`, ['csa','instance.data.findPayloadIndex','initialize','habitude-main']);


                // EB TODO format the warnings appropriately
                instance.data.frontendWarnings.push(warning);
                // add to a list of warnings ^^[]{}
            }

            return {
                value: index,
                error: error
            }
        }

        instance.data.checkKey = function (keyValue, hspki) {
            //oftentimes we store stringified objects within our map object. The main reason for this is to facilitate the bindings between our codebase and Bubble, 
            //as the interpreter that compiles our JSON into a Bubble object uses strict typing - i.e. we can't provide an object!
            //So we store objects in a "{\"some_key\": \"some_value\"}" syntax.
            //
            //This function takes a string from a key value pair and checks what kind of data we are really storing in there - i.e. is it actually a stringified object or array.
            //run a typeof check on the value
            var typeofKeysValue = typeof keyValue;


            switch (true) {

                case (typeofKeysValue === 'object' && keyValue === null):
                    return {
                        type: 'null',
                        value: null,
                        hskpi: hspki,
                        error: null
                    };

                case (typeofKeysValue === 'object' && Array.isArray(keyValue)):

                    if (keyValue.length > 0) {

                        let arrClone = keyValue.map(function (e) { return e; });

                        arrClone.forEach(function (arrayItem, index) {
                            if (typeof arrayItem === 'string') {

                                var bookends = String(arrayItem).substring(0, 1) + String(arrayItem).substring(String(arrayItem).length - 1, String(arrayItem).length);


                                var isStringifiedArray = bookends === "[]";
                                var isStringifiedObject = bookends === "{}";

                                if (isStringifiedObject) {

                                    try {
                                        var arrItemAsObj = JSON.parse(arrayItem);
                                        arrClone[index] = arrItemAsObj;

                                    }

                                    catch (err) {
                                        //add some error logging in here
                                    }
                                }

                            }
                        });

                        return {
                            type: 'array/evaluate_each',
                            value: arrClone,
                            hskpi: hspki,
                            error: null
                        };
                    }

                    else {
                        return {
                            type: 'empty_array/none',
                            value: keyValue,
                            hskpi: hspki,
                            error: null
                        };
                    }

                    break;

                case typeofKeysValue === 'object':
                    return {
                        type: 'object/evaluate',
                        value: [keyValue],
                        hskpi: hspki,
                        error: null
                    };
                    break;

                case typeofKeysValue === 'string':

                    var bookends = String(keyValue).substring(0, 1) + String(keyValue).substring(String(keyValue).length - 1, String(keyValue).length);
                    var isStringifiedArray = bookends === "[]";
                    var isStringifiedObject = bookends === "{}";

                    if (!isStringifiedArray && !isStringifiedObject) {
                        return {
                            type: 'string/none',
                            value: keyValue,
                            hskpi: hspki,
                            error: null
                        };
                    }

                    else if (isStringifiedArray) {
                        try {

                            var keyValueAsArr = JSON.parse(keyValue);
                            return {
                                type: 'stringified_array/evaluate',
                                value: keyValueAsArr,
                                hskpi: hspki,
                                error: null
                            };
                        }

                        catch (err) {
                            return {
                                type: 'error',
                                value: null,
                                hskpi: hspki,
                                error: err
                            };
                        }
                    }

                    else if (isStringifiedObject) {
                        try {
                            var keyValueAsObj = JSON.parse(keyValue);
                            return {
                                type: 'stringified_object/evaluate',
                                value: [keyValueAsObj],
                                hskpi: hspki,
                                error: null
                            };
                        }

                        catch (err) {
                            return {
                                type: 'error',
                                value: null,
                                hskpi: hspki,
                                error: err
                            };
                        }
                    }

                    break;

                default:
                    return {
                        type: typeofKeysValue + "/none",
                        value: keyValue,
                        hspki: hspki,
                        error: null
                    }

                    break;
                        }
        };

        instance.data.attributes = {
            library: []
        };

        instance.data.attributes.update = function (objArr, type, attributes) {

            var error;

            objArr.forEach(obj => {
                var ind = attributes.findIndex(a => a.reference === obj.key);
                if (ind > -1) {
                    attributes[ind][type] = obj.value;
                }
                else {
                    var atrInd = instance.data.attributes.library.findIndex(atr => atr.reference === obj.key);
                    if (atrInd > -1) {
                        var atr = instance.data.attributes.library[atrInd];
                        attributes.push({
                            reference: obj.key,
                            name: atr.name,
                            [atr.type]: obj.value,
                            type: atr.type
                        });
                    }
                    else {
                        if (obj.key) {

                            attributes.push({
                                reference: obj.key,
                                name: "#" + obj.key,
                                [type]: obj.value,
                                type: type
                            });

                        }

                    }
                }
            });

            return {
                output: attributes,
                error: error
            };

        };

        instance.data.functions = {

            vectoriseText: function(body, map) {

                try {
                    var isNotSafe = instance.data.isEmpty(body) || typeof body === 'object' || typeof body === 'number';

                    if (isNotSafe) return body;
                    //console.log(`[instance.data.functions.vectoriseText]\nAbout to process\n${body}\n`);
                    //console.log(`[instance.data.functions.vectoriseText]\nStringified is\n${JSON.stringify(body)}\n`);

                    //collect all of the tags into an array
                    var textSplitByTags = instance.data.isNotEmpty(body) ? body.match(/{{.*?\}}/g) : null;
                    //console.log(`Split up for processing\n${textSplitByTags}`);

                    var toBeProcessed = body;
                    var beenProcessed = []; //everything will be pushed from a across to b

                    if (textSplitByTags === null) {
                        if (instance.data.isNotEmpty(toBeProcessed)) beenProcessed.push(toBeProcessed);
                        else beenProcessed.push("");
                        return beenProcessed.join();
                    }

                    for (var thisSplitIndex = 0; thisSplitIndex < textSplitByTags.length; thisSplitIndex++) {

                        //console.log("been processed is ", beenProcessed);
                        //console.log("being processed is ", textSplitByTags[thisSplitIndex]);

                        //console.log("toBeProcessed.substring(0, toBeProcessed.indexOf(textSplitByTags[x]) - 2) is ", toBeProcessed.substring(0, toBeProcessed.indexOf(textSplitByTags[thisSplitIndex])));

                        //push all vanilla text left of the tag from toBeProcessed into beenProcessed
                        var indexOfThisTagStart = toBeProcessed.indexOf(textSplitByTags[thisSplitIndex]);
                        var textLeftOfTag = toBeProcessed.substring(0, indexOfThisTagStart);
                        if (textLeftOfTag !== "") {
                            beenProcessed.push(textLeftOfTag);
                        }

                        //console.log("toBeProcessed.substring(toBeProcessed.indexOf(textSplitByTags[x]), toBeProcessed.length) is ", toBeProcessed.substring(toBeProcessed.indexOf(textSplitByTags[thisSplitIndex]), toBeProcessed.length));
                        //remove everything left of the text from toBeProcessed
                        toBeProcessed = toBeProcessed.substring(indexOfThisTagStart, toBeProcessed.length);

                        //push the tag from b into a
                        if (textSplitByTags[thisSplitIndex]) {
                            var tag = textSplitByTags[thisSplitIndex].replaceAll('{{', '').replaceAll('}}', '')
                            var tagSplit = tag.split('/');
                            var tagType = tagSplit[6];
                            var returnObj;

                            //tag types are:
                            //   - t: a merge tag, a reference to another piece of data stored elsewhere in the process
                            //   - a: attribute tag, a reference to a piece of live or global context brought in from runtime
                            //   - c: contact tag, a reference to a contact within the tenancy

                            switch (tagType){

                                case 'a': 
                                    //currently running attributes through the same function as merge tags
                                    //there's probably a case to do this differently in the future

                                case 't':
                                    returnObj = createMergeTag(tag, map);
                                    break;

                                case 'c':
                                    //console.log(`About to createContactTag with ${tag}`);
                                    returnObj = createContactTag(tag);
                                    //console.log(`\nreturnObject is:\n${JSON.stringify(returnObj)}`);
                                    break;

                                case 'x':
                                    returnObj = createCustomText(tag);
                                    break;

                                default:
                                    returnObj = "";
                                    break;
                                           }

                            beenProcessed.push(returnObj);
                            //console.log(`beenProcessed array is now:\n${JSON.stringify(beenProcessed)}`);
                        }

                        //remove magic text from b
                        toBeProcessed = toBeProcessed.substring(textSplitByTags[thisSplitIndex].length, toBeProcessed.length);

                        //if it's the last run then dump the last bit of b across into a
                        if (thisSplitIndex === (textSplitByTags.length - 1)) {
                            if (toBeProcessed !== "") {
                                beenProcessed.push(toBeProcessed);
                            }
                        }
                    }
                    return beenProcessed;
                }

                catch (err) {

                    instance.data.sendLogglyError("error", null , `Hit an error trying to vectorise text\n[ARGUMENTS]\n\n(objArr, type, attributes)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['csa','instance.data.functions.vectoriseText','initialize','habitude-main']);
                }


                //VECTORISE FUNCTIONS
                function createMergeTag(toFind, map) {

                    //loop through actions
                    var found = false;
                    var expressionSplit = toFind.split('/');

                    //mergeTag syntax is '{{reference / editor message / step index / list index / transformation / parameter / tag type}}';
                    var reference = expressionSplit[0] ? expressionSplit[0] : null;
                    var editorMessage = expressionSplit[1] ? expressionSplit[1] : null;
                    var stepIndex = expressionSplit[2] ? expressionSplit[2] : null;
                    var listIndex = expressionSplit[3] ? expressionSplit[3] : null;
                    var transformation = expressionSplit[4] ? expressionSplit[4] : null;
                    var parameter = expressionSplit[5] ? expressionSplit[5] : null;
                    var tagType = expressionSplit[6] ? expressionSplit[6] : null;

                    //if this is not an attribute then go find the lookup within the map
                    if (tagType === 't') {

                        var thisAction;
                        var thisPayload;

                        for (var actionIndex = 0; actionIndex < map._p_actions.length; actionIndex++) {

                            thisAction = map._p_actions[actionIndex];
                            //loop through outputs
                            for (var payloadIndex = 0; payloadIndex < thisAction._p_payload.length; payloadIndex++) {

                                thisPayload = thisAction._p_payload[payloadIndex];
                                if (thisPayload._p_builderRef && toFind) {

                                    if (thisPayload._p_builderRef.split('/')[0] !== toFind.split('/')[0]) continue;

                                    found = true;

                                    return {
                                        function: "lookup_single",
                                        version: "1",
                                        params: {
                                            text: toFind,
                                            actionRef: thisAction._p_lookupID,
                                            payloadRef: thisPayload._p_ref,
                                            type: thisPayload._p_type,
                                            listIndex: listIndex,
                                            transformation: transformation,
                                            parameter: parameter,
                                            editorReference: editorMessage,
                                            stepIndex: thisAction._p_actionIndex
                                        }
                                    };
                                }

                            }

                            if (found) break;

                            instance.data.sendLogglyError("issue", null , `Didn't locate the requested payloaded [${toFind}] whilst building a tag`, ['csa','instance.data.functions.vectoriseText.createMergeTag','initialize','habitude-main']);

                            if (actionIndex == (map._p_actions.length - 1)) {

                                instance.publishState("error", "ERROR: [create dynamic payload] Never found " + reference + " within Habit [" + map._p_habitID + "].\n" + JSON.stringify(map));
                                instance.triggerEvent("error", function (err) { });

                                return {
                                    function: "lookup_single",
                                    version: "1",
                                    params: {
                                        text: toFind,
                                        actionRef: null,
                                        payloadRef: null,
                                        type: null,
                                        listIndex: listIndex,
                                        transformation: transformation,
                                        parameter: parameter,
                                        editorReference: editorMessage,
                                        stepIndex: stepIndex
                                    }
                                };
                            }

                        }
                    }

                    else if (tagType === 'a') {

                        if (toFind) {
                            //console.log("Inside attribute hunt\nAttributes library is\n",instance.data.attributes.library);
                            var ind = instance.data.attributes.library.findIndex(atr => atr.reference === expressionSplit[0].replaceAll('#', ''));
                            if (ind > -1) {
                                return {
                                    function: "lookup_single",
                                    version: "1",
                                    params: {
                                        text: toFind,
                                        actionRef: "#",
                                        payloadRef: instance.data.attributes.library[ind].reference,
                                        type: instance.data.attributes.library[ind].type,
                                        listIndex: listIndex,
                                        transformation: transformation,
                                        parameter: parameter,
                                        editorReference: editorMessage,
                                        stepIndex: "#"
                                    }
                                };
                            }
                            else {

                                instance.data.sendLogglyError("issue", null , `Didn't locate the requested attribute whilst building a tag\n[ARGUMENTS]\n(toFind, map)\n${JSON.stringify(arguments)}`, ['csa','instance.data.functions.vectoriseText.createMergeTag','initialize','habitude-main']);

                                instance.publishState("error", "ERROR: [create dynamic payload] Never found attribute " + toFind + " within Habit [" + instance.data.attributes.library + "]. \n" + JSON.stringify(map));

                                return {
                                    function: "lookup_single",
                                    version: "1",
                                    params: {
                                        text: toFind,
                                        actionRef: null,
                                        payloadRef: null,
                                        type: null,
                                        listIndex: listIndex,
                                        transformation: transformation,
                                        parameter: parameter,
                                        editorReference: editorMessage,
                                        stepIndex: stepIndex
                                    }
                                };
                            }
                        }


                    }

                };

                function createContactTag(tag){

                    // {{ email / editor text / @ / name / uid / lookup / tag}}
                    // {{izzi@habitude.co/I Dorrian/@/Izzi|^^|Dorrian/12345_54321/email/c}}
                    var tagSplit = tag.split('/');

                    var email = tagSplit[0] ? tagSplit[0] : null;
                    var name = tagSplit[3] ? tagSplit[3] : null;
                    var uid = tagSplit[4] ? tagSplit[4] : null;
                    var lookupKey = tagSplit[5] ? tagSplit[5] : null;

                    return {
                        function: 'lookup_contact',
                        version: "1",
                        params: {
                            text: tag,
                            email: email,
                            name: name,
                            uid: uid,
                            lookupKey: lookupKey
                        }
                    };
                };

                function createCustomText(tag){

                    // {{ null / custom text / symbol / type / null / null / tag}}
                    // {{izzi@habitude.co/I Dorrian/@/Izzi|^^|Dorrian/12345_54321/email/c}}
                    var tagSplit = tag.split('/');

                    var customText = tagSplit[1] ? tagSplit[1].replaceAll('&#47;','/').replaceAll('&#34;', '\"'): null;
                    var type = tagSplit[3] ? tagSplit[3] : null;

                    var symbol;
                    switch (type){
                        case 'email':
                            symbol = '@';
                            break;

                        default:
                            symbol = 'null';
                            break;
                                };

                    tag = `null/${tagSplit[1]}/${symbol}/${type}/null/null/x`;

                    return {
                        function: 'lookup_custom',
                        version: "1",
                        params: {
                            text: tag,
                            customText: customText,
                            type: type
                        }
                    }
                };

            },
            healthcheck: {
                integration: function (map, obj) {
                    return {
                        last_ping: !obj.params.last_ping ? null : new Date(obj.params.last_ping),
                        payload: JSON.stringify(obj)
                    }
                }
            },
            render: {
                integration: function (map, body, grade, attributes, hspki) {

                    try {



                        if (instance.data.consoleLogging) {
                            console.log("   |")
                            console.log("   |")
                            console.log("===> instance.data.functions.render.integration")
                            console.log();
                            console.log("Parameters");
                            console.log("=> map (as normal)");
                            console.log("=> attributes (as normal)");
                            console.log("=> body");
                            console.log(body);
                            console.log("=> grade");
                            console.log(grade);
                            console.log("- - - - - - - -");
                            console.log();
                        }
                        var error = "";

                        for (var node_key in body.params.data) {

                            let node_value = body.params.data[node_key];

                            if (instance.data.consoleLogging) {
                                console.log("Key: ", node_key);
                                console.log("Value:");
                                console.log(node_value);
                            }
                            //...and once it's parsed we'll check what we're dealing with: array, object or string
                            let type = Object.prototype.toString.call(node_value) === '[object Array]' ? 'array'
                            : !node_value ? null
                            : typeof node_value === 'object' ? 'object'
                            : null;

                            //If it's an array then we'll check whether it's got further arrays inside
                            if (type === 'array') {

                                if (instance.data.consoleLogging) {
                                    console.log();
                                    console.log("...which is an array");
                                }
                                if (node_value.some(arr_item => Object.prototype.toString.call(arr_item) === '[object Array]')) {

                                    //if it does, then we'll evaluateArray each of them in turn
                                    node_value.forEach((item, ind) => {

                                        if (instance.data.consoleLogging) {
                                            console.log();
                                            console.log("Item " + ind + " in the array is");
                                            console.log(item);
                                            console.log();
                                        }
                                        //now let's find out what type of object we're dealing with inside the array
                                        let item_type = Object.prototype.toString.call(node_value) === '[object Array]' ? 'array'
                                        : !node_value ? null
                                        : typeof node_value === 'object' ? 'object'
                                        : null;

                                        //if the item is an array contains we're going to send that off for evaluateArraying
                                        if (item_type === 'array') {

                                            //send the sub-array off for evaluateArraying, as normal
                                            let res = instance.data.functions.render.evaluateArray(item, map, grade, attributes, hspki);

                                            if (!res.error) {

                                                if (instance.data.consoleLogging) {
                                                    console.log();
                                                    console.log("Returned value from evaluateArraying the array inside Integration");
                                                    console.log(res.value);
                                                }
                                                //replace the array with a single value
                                                body.params.data[node_key][ind] = res.value;
                                            }

                                            else {

                                                error += "Tried to evaluateArray [" + node_value + "] but hit an issue. Error message [" + res.error + "]";

                                            }

                                        }

                                        else if (item_type === 'object'
                                                 && "function" in item
                                                 && item.function in instance.data.functions.render) {

                                            try {

                                                var res = instance.data.functions.render[node_value.function](map, node_value, grade, attributes, hspki);

                                                if (!(res.error)) {

                                                    if (instance.data.consoleLogging) {
                                                        console.log();
                                                        console.log("Returned value from lookup function");
                                                        console.log(res.value);
                                                    }
                                                    body.params.data[node_key][ind] = res.value;

                                                }

                                                else {
                                                    error += "Tried to run ["
                                                        + node_value.function
                                                        + "] but hit a HANDLED issue. Message is ["
                                                        + res.error
                                                        + "]";
                                                }
                                            }

                                            catch (err) {

                                                error += "Tried to run ["
                                                    + node_value.function
                                                    + "] but hit an UNHANDLED issue. Message is ["
                                                    + err
                                                    + "]";
                                            }
                                        }

                                    }) //forEach
                                }

                                else {

                                    let res = instance.data.functions.render.evaluateArray(node_value, map, grade, attributes, hspki);

                                    if (!res.error) {

                                        //replace the array with a single value
                                        body.params.data[node_key] = res.value;
                                    }

                                    else {

                                        error += "Tried to evaluateArray [" + node_value + "] but hit an issue. Error message [" + res.error + "]";

                                    }

                                }



                            }

                            //and if it's an object we'll send it off if it's function is part of the rendering library
                            else if (type === 'object'
                                     && "function" in node_value
                                     && node_value.function in instance.data.functions.render) {

                                //console.log("And found an object");
                                try {
                                    var res = instance.data.functions.render[node_value.function](map, node_value, grade, attributes, hspki);
                                    if (!(res.error)) {
                                        body.params.data[node_key] = res.value;
                                    }
                                    else {
                                        error += "Tried to run [" + node_value.function + "] but hit a HANDLED issue. Message is [" + res.error + "]";
                                    }
                                }
                                catch (err) {
                                    error += "Tried to run [" + node_value.function + "] but hit an UNHANDLED issue. Message is [" + err + "]";
                                }



                            }

                        };

                        if (instance.data.consoleLogging) {
                            console.log("Return value");
                            console.log({
                                value: JSON.stringify(body),
                                error: error
                            });
                            console.log("____________________");
                            console.log("   |")
                            console.log("   |")
                        }
                        return {
                            value: JSON.stringify(body),
                            error: error
                        };
                    }
                    catch (err) {

                        instance.data.sendLogglyError("issue", hspki , `Didn't locate the requested attribute whilst building a tag\n[ARGUMENTS]\n(map, body, grade, attributes, hspki)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['csa','instance.data.functions.render.integration','initialize','habitude-main']);

                    }

                },

                lookup_single: function (map, obj, grade, attributes, hspki) {

                    try {

                        /*DATA MODEL
                        {
                            function: "lookup_single",
                            version: "1",
                            params: {
                                text: toFind,
                                actionRef: "#",
                                payloadRef: instance.data.attributes.library[ind].reference,
                                type: instance.data.attributes.library[ind].type,
                                listIndex: listIndex,
                                transformation: transformation,
                                parameter: parameter,
                                editorReference: editorReference,
                                stepIndex: "#"
                            }
                        };
                        */

                        var error = "";
                        if (instance.data.consoleLogging) {
                            console.log("   |")
                            console.log("   |")
                            console.log("===> instance.data.functions.render.lookup_single")
                            console.log();
                            console.log("Parameters");
                            console.log("=> map");
                            console.log();
                            console.log("=> obj");
                            console.log(JSON.parse(JSON.stringify(obj)));
                            console.log();
                            console.log("=> grade");
                            console.log(grade);
                            console.log("- - - - - - - -");
                            console.log();
                        }

                        var output, fetchedValue, type, action, payload;
                        var notFound = false;

                        var isAttribute = obj.params.actionRef === "#";
                        var version = obj.version;

                        var delimiter = version === "1" ? "/" : "^_";
                        var noTagSymbol = version === "1" ? "!" : "¡";

                        if (version !== "1") {
                            //console.log()

                            //console.log(obj);
                            //console.log(`Version is ${version}\ndelimiter: ${delimiter}\nnoTagSymbol: ${noTagSymbol}`);
                        };


                        //locate the value & the type in the json & attribute maps
                        //find non-attributes
                        //locate the value & the type in the json & attribute maps
                        //find non-attributes
                        if (!isAttribute) {

                            var actionInd = instance.data.findStepIndex(map, obj.params.actionRef, hspki);
                            //console.log(`[lookup_single] actionInd\n${JSON.stringify(actionInd)}`);
                            if (actionInd.value < 0) notFound = true;
                            else action = map._p_actions[actionInd.value];

                            //find the position of the payload in the payload array
                            var payloadInd = !notFound ? instance.data.findPayloadIndex(map, obj.params.payloadRef, actionInd.value, hspki) : {value: -1};
                            //console.log(`[lookup_single] payloadInd\n${JSON.stringify(payloadInd)}`);
                            if (payloadInd.value < 0) notFound = true;

                            else {
                                //console.log(`action exists: ${!!action}`);
                                //console.log(`About to set payload within action of ID: ${action._p_actionID}`);
                                payload = action._p_payload[payloadInd.value]
                                //console.log(`Payload is now:`);
                                //console.log(payload);
                            };


                            if (notFound && grade === "full") notFound = (function(){

                                //console.log(`\n`);
                                //console.log(`About to go looking for ${obj.params.editorReference}`);

                                // Grab the editor reference
                                let payloadRefTarget = obj.params.payloadRef;
                                let editorReferenceTarget = obj.params.editorReference.toLowerCase().replace('&nbsp;','').substring(0,15);

                                if (editorReferenceTarget.includes('pdf')) return true;
                                if (editorReferenceTarget.includes('outcome')) return true;

                                //console.log(`editorReferenceTarget: ${editorReferenceTarget}`);


                                console.log("About to create macroAction");
                                // Map over the actions
                                let macroAction = map._p_actions.find(action => {
                                    return action._p_actionID === hspki.step; 
                                });

                                //console.log("macroAction is:");
                                //console.log(macroAction._p_actionID);

                                //console.log(`\n`);
                                //console.log(`map has ${map._p_actions.length} steps`);

                                let currentActionLoopPoint = map._p_actions.findIndex(action => {
                                    return action._p_actionIndex === macroAction._p_actionIndex;
                                });

                                //console.log("currentActionLoopPoint");
                                //console.log(currentActionLoopPoint);
                                //console.log(`\n`);

                                //currently at actionIndex: 4

                                if (instance.data.consoleLogging) console.log(`We're going to loop until ${currentActionLoopPoint}`);

                                //console.log(`about to loop until ${currentActionLoopPoint}`);

                                for (var actionIndex = 0; actionIndex < currentActionLoopPoint; actionIndex++) {

                                    let thisAction = map._p_actions[actionIndex];
                                    if (instance.data.consoleLogging) console.log("Current action in loop is:");
                                    if (instance.data.consoleLogging) console.log(thisAction._p_actionID);

                                    if (!notFound) break;

                                    // Iterate through the payloads
                                    thisAction._p_payload.forEach((thisPayload, payloadIndex) => {

                                        if (instance.data.consoleLogging) console.log("Opening up the payload:");
                                        if (instance.data.consoleLogging) console.log(thisPayload);

                                        if (!notFound) return;
                                        if (!thisPayload._p_builderRef) return;


                                        let builderRef = thisPayload._p_builderRef.includes('/') ? thisPayload._p_builderRef.split('/')[1] : thisPayload._p_builderRef;
                                        builderRef = builderRef.toLowerCase();

                                        /*
                                        if (thisPayload._p_ref === payloadRefTarget || builderRef.includes(editorReferenceTarget)){
                                            console.log(`---> builerRef: ${builderRef}`);
                                            console.log(`---> payloadRef: ${payloadRefTarget}`);
                                            console.log(`-----> .includes(editorReferenceTarget): ${builderRef.includes(editorReferenceTarget)}`);
                                            console.log(`\n`);
                                            console.log(`\n`);
                                        }
                                        */


                                        //console.log("Logging HSPKI");
                                        //console.log(hspki);

                                        // First check if this payload's ref matches the tags
                                        if (thisPayload._p_ref === payloadRefTarget || builderRef.includes(editorReferenceTarget)) {
                                            //console.log("WE FOUND A MATCH!!");
                                            //console.log("...using payloadRef: " + payloadRefTarget);
                                            if (editorReferenceTarget.indexOf('pdf') > -1) console.log("It's a PDF payload");
                                            //console.log(`Setting actionInd.value to: ${actionIndex}`);
                                            //console.log(`Setting payloadInd.value to: ${payloadIndex}`);
                                            actionInd.value = actionIndex;
                                            payloadInd.value = payloadIndex;
                                            notFound = false;
                                        }

                                    })
                                };

                                //console.log(`About to return notFound of ${notFound}`);

                                return notFound;
                            })();

                            //console.log(`notFound is ${notFound}`);
                            if (!notFound) {
                                if (obj.params.payloadRef === "q2PMHKyCq5") {

                                    console.log(`\nTag was found`);
                                    console.log(`actionInd is: ${actionInd.value}`);
                                    console.log(`payloadInd is: ${payloadInd.value}`);

                                }
                                //console.log(`\nTag was found`);
                                //console.log(`actionInd is: ${actionInd.value}`);
                                //console.log(`payloadInd is: ${payloadInd.value}`);
                            };


                            if (notFound) {

                                //console.log("Tag [" + obj.params.editorReference +"]couldn't be found");

                                //console.log(`\nhspki\n${JSON.stringify(hspki)}`);

                                try {
                                    if (grade === "partial") instance.data.warnings.addWarning("VALIDATION_invalid_reference", hspki.step, obj.params.editorReference);
                                }
                                catch (err){
                                    //console.log(`[lookup_single] Hit an issue trying to add a warning`);
                                }

                                //assign a step number to the returned tag - if we found an action then use that, 
                                //otherwise we'll defer to the Step Index held inside the tag

                                if (grade === 'partial') {

                                    let returnValueSplit = obj.params.text.split(delimiter);
                                    let stepIndex = action ? action._p_actionIndex : returnValueSplit[2];

                                    //console.log(`returnValueSplit`);
                                    //console.log(returnValueSplit);

                                    output = `{{${returnValueSplit[0]}${delimiter}${returnValueSplit[1]}${delimiter}${stepIndex}${noTagSymbol}${delimiter}${!returnValueSplit[3] ? 'null' : returnValueSplit[3]}${delimiter}${!returnValueSplit[4] ? 'null' : returnValueSplit[4]}${delimiter}${!returnValueSplit[5] ? 'null' : returnValueSplit[5]}${delimiter}${!returnValueSplit[6] ? 'null' : returnValueSplit[6]}}}`;

                                    //console.log("Created a partial tag for missing reference:");
                                    //console.log(output);

                                }

                                else if (grade === 'full') {
                                    output = "not found";
                                }

                                //console.log("About to return");
                                //console.log({value: output,error: null});
                                return {
                                    value: output,
                                    error: null
                                }
                            };

                            type = obj.params.type;

                            //check if the types are different.... if they are, defer with the type of the payload

                            //console.log(`Type is: ${type}\nPayload looks like\n${JSON.stringify(map._p_actions[actionInd.value]._p_payload[payloadInd.value])}`);
                            fetchedValue = map._p_actions[actionInd.value]._p_payload[payloadInd.value][`_p_${obj.params.type}`];

                            //console.log(`fetchedValue is: ${fetchedValue}`);

                        }

                        //find attributes
                        else if (isAttribute) {

                            if (grade === 'partial'){

                                return {
                                    value: '{{' + obj.params.text + '}}',
                                    error: null
                                };
                            }

                            //console.log("Object is: " + JSON.stringify(obj));

                            //console.log("attributes are: \n", attributes);

                            var attributeInd = attributes.findIndex(atr => atr.reference === obj.params.payloadRef);
                            //console.log("Inside isAttribute\nFound an index of: " + attributeInd + "\nGrade is " + grade);

                            //if the attriute isn't found then handle
                            if (attributeInd < 0) {

                                //if (attributes && attributes.length > 0) instance.data.sendLogglyError("issue", hspki , `During render, can't locate the attribute tag: ${JSON.stringify(obj.params)}`, ['csa','instance.data.functions.render.lookup_single','initialize','habitude-main']);

                                if (grade === 'full') {
                                    output = "not  found"
                                }

                                return {
                                    value: output,
                                    error: null
                                }

                            }

                            else if (attributeInd > -1){

                                type = attributes[attributeInd].type;
                                fetchedValue = attributes[attributeInd][type];                                

                            }

                        }



                        //then process the value according to its type & any transformations
                        //quickly handle partial render
                        if (grade === 'partial') {

                            let returnValueSplit = obj.params.text.split(delimiter);
                            let stepIndex = action ? action._p_actionIndex : returnValueSplit[2];
                            let partialTag = `{{${returnValueSplit[0]}${delimiter}${returnValueSplit[1]}${delimiter}${stepIndex}${delimiter}${!returnValueSplit[3] ? 'null' : returnValueSplit[3]}${delimiter}${!returnValueSplit[4] ? 'null' : returnValueSplit[4]}${delimiter}${!returnValueSplit[5] ? 'null' : returnValueSplit[5]}${delimiter}${!returnValueSplit[6] ? 'null' : returnValueSplit[6]}}}`;

                            //console.log(`partialTag is ${partialTag}`);


                            output = partialTag;
                        }

                        //now handle full render
                        else if (grade === 'full'){

                            //console.log("lookup_single");
                            //console.log(fetchedValue);
                            //console.log(JSON.stringify(obj, null, 2));

                            //type = `_p_${type}`;
                            var isArray = Object.prototype.toString.call(fetchedValue) === '[object Array]';

                            switch (type) {
                                case 'listText':

                                    //console.log("Handling listText");
                                    //console.log(fetchedValue);
                                    //console.log("")

                                    if (!isArray) break;
                                    switch (obj.params.listIndex) {
                                        case 'null':
                                        case null:
                                        case undefined:
                                            //console.log()
                                            //console.log("About to join the array");
                                            output = fetchedValue.join(', ');
                                            break;

                                        case 'FIRST':
                                            output = fetchedValue[0] ? String(fetchedValue[0]) : '';
                                            break;

                                        case 'LAST':
                                            //console.log("Inside last");
                                            var lastIndex = fetchedValue.length - 1;
                                            output = fetchedValue[lastIndex] ? String(fetchedValue[lastIndex]) : '';
                                            break;

                                        default:
                                            var index;
                                            var isNumber = !(isNaN(Number(obj.params.listIndex)));
                                            if (isNumber) index = Number(obj.params.listIndex) - 1;
                                            else {
                                                output = '';
                                                break;
                                            }

                                            output = fetchedValue[index] ? String(fetchedValue[index]) : '';
                                            break;
                                                                }

                                    break;

                                case 'listNumber':
                                    if (!isArray) break;
                                    //handle lists of numbers here
                                    break;

                                case 'listDate':
                                    if (!isArray) break;
                                    //handle lists of dates here
                                    break;

                                case 'valueDate':

                                    var transformation = obj.params.transformation;

                                    switch (transformation){
                                        case 'null':
                                        case "long":
                                            //console.log("Inside long");
                                            var tempDate = fetchedValue;
                                            try {
                                                var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                                                var timestamp = Date.parse(tempDate);

                                                if (isNaN(timestamp) == false) {
                                                    tempDate = new Date(timestamp).toLocaleDateString("en-UK", options);;
                                                }
                                            }
                                            catch (err){
                                                //console.log("Caught an error");
                                            }
                                            output = tempDate;
                                            break;

                                        case "iso":
                                        default:
                                            output = fetchedValue;
                                            break;
                                                          };

                                    break; 

                                case 'valueText':
                                    //console.log(`Handling valueText\nfetchedValue = ${fetchedValue}`);
                                    output = (fetchedValue == null) ? '' : String(fetchedValue)
                                    // output = String(fetchedValue);
                                    break;

                                case 'valueNumber':
                                    output = isNaN(Number(fetchedValue)) ? null : Number(fetchedValue);
                                    break;

                                case 'valueBoolean' :
                                    if (fetchedValue) output = true;
                                    else output = false;
                                    break;

                                default:
                                    output = fetchedValue;
                                    break;

                                        }
                        }

                        //console.log(`Returning ${output} to outer function`);

                        return {
                            value: output,
                            error: null
                        };
                    }
                    catch (err){
                        instance.data.sendLogglyError("error", hspki , `Hit an unhandled error doing a merge tag lookup\n[ARGUMENTS]\n(map, obj, grade, attributes, hspki)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['csa','instance.data.functions.render.lookup_single','initialize','habitude-main']);
                        console.error(err);
                    }

                },

                lookup_custom: function (map, obj, grade, attributes, hspki){

                    /* DATA MODEL
                        {
                            function: 'lookup_custom',
                            params: {
                                text: tag,
                                customText: customText,
                                type: type
                            }
                        }
                        */

                    var output;

                    if (instance.data.consoleLogging) {
                        console.log("   |")
                        console.log("   |")
                        console.log("===> instance.data.functions.render.lookup_custom")
                        console.log();
                        console.log("Parameters");
                        console.log("=> map");
                        console.log();
                        console.log("=> obj");
                        console.log(obj);
                        console.log();
                        console.log("=> grade");
                        console.log(grade);
                        console.log("- - - - - - - -");
                        console.log();
                    }

                    if (grade === 'partial') {

                        output = `{{${obj.params.text}}}`;

                        return {
                            value: output,
                            error: null
                        }
                    }

                    else if(grade === 'full'){

                        output = obj.params.customText;
                        return {
                            value: output,
                            error: null
                        }

                    }

                },

                lookup_contact: function (map, obj, grade, attributes, hspki){

                    /* DATA MODEL
                        {
                            function: 'lookup_contact',
                            params: {
                                text: tag,
                                email: email,
                                name: name,
                                uid: uid,
                                lookupKey: lookupKey
                            }
                        }
                        */

                    var output;

                    if (instance.data.consoleLogging) {
                        console.log("   |")
                        console.log("   |")
                        console.log("===> instance.data.functions.render.lookup_custom")
                        console.log();
                        console.log("Parameters");
                        console.log("=> map");
                        console.log();
                        console.log("=> obj");
                        console.log(obj);
                        console.log();
                        console.log("=> grade");
                        console.log(grade);
                        console.log("- - - - - - - -");
                        console.log();
                    }

                    if (grade === 'partial') {

                        output = `{{${obj.params.text}}}`;

                        return {
                            value: output,
                            error: null
                        }
                    }

                    else if(grade === 'full'){

                        output = obj.params[obj.params.lookupKey];

                        return {
                            value: output,
                            error: null
                        }

                    }

                },

                checklist_item: function (map, body, grade, attributes, hspki) {

                    var keys_in_scope = ['title', 'description', 'url_link', 'other_meta'];
                    var error = "";

                    for (var l = 0; l < keys_in_scope.length; l++) {


                        let node_key = keys_in_scope[l];
                        let node_value = body.params[node_key];
                        //...and once it's parsed we'll check what we're dealing with: array, object or string
                        let type = Object.prototype.toString.call(node_value) === '[object Array]' ? 'array'
                        : !node_value ? null
                        : typeof node_value === 'object' ? 'object'
                        : null;

                        //If it's an array then we'll send that off for evaluateArraying
                        if (type === 'array') {

                            let res = instance.data.functions.render.evaluateArray(node_value, map, grade, attributes);
                            if (!res.error) {
                                body.params[node_key] = res.value;
                            }
                            else {
                                error += "Tried to evaluateArray [" + node_value + "] but hit an issue. Error message [" + res.error + "]";
                            }
                        }

                        //and if it's an object we'll send it off if it's function is part of the rendering library
                        else if (type === 'object'
                                 && "function" in node_value
                                 && node_value.function in instance.data.functions.render) {

                            try {
                                var res = instance.data.functions.render[node_value.function](map, node_value, grade, attributes);
                                if (!(res.error)) {
                                    body.params[node_key] = res.value;
                                }
                                else {
                                    error += "Tried to run [" + node_value.function + "] but hit a HANDLED issue. Message is [" + res.error + "]";
                                }
                            }
                            catch (err) {
                                error += "Tried to run [" + node_value.function + "] but hit an UNHANDLED issue. Message is [" + err + "]";
                            }



                        }

                    };
                    return {
                        value: JSON.stringify(body),
                        error: error
                    };



                },

                //cycles through an array (body) and checks each item for  
                evaluateArray: function (body, map, grade, attributes, hspki) {

                    if (instance.data.consoleLogging) {
                        console.log("   |")
                        console.log("   |")
                        console.log("===> instance.data.functions.render.evaluateArray")
                        console.log();
                        console.log("Parameters");
                        console.log("=> map (as normal)");
                        console.log();
                        console.log("=> attributes (as normal)");
                        console.log();
                        console.log("=> body");
                        console.log(body);
                        console.log();
                        console.log("=> grade");
                        console.log(grade);
                        console.log("- - - - - - - -");
                        console.log();
                    }
                    var error = "";
                    var output = "";
                    //cycle through each item in the body
                    for (var x = 0; x < body.length; x++) {

                        if (instance.data.consoleLogging) {
                            console.log("evaluateArraying item " + (x + 1) + " of " + body.length + " inside evaluateArray function");
                        }
                        //we're going to just add basic text straight into the output text
                        if (typeof body[x] == "string" || (typeof body[x] == "object" && !(body[x]))) {
                            output += body[x];

                            //but if we hit on an object then we're going to do whatever we need to do
                        }
                        else if (typeof body[x] == "object" && body[x]) {

                            if ("function" in body[x]) {

                                try {
                                    if (body[x].function in instance.data.functions.render) {
                                        if (instance.data.consoleLogging) {
                                            console.log("Calling instance.data.functions.render.", body[x].function);
                                            console.log("with payload of:");
                                            console.log(body[x]);
                                            console.log("   |")
                                            console.log("   |")
                                            console.log("   |")
                                        }
                                        let res = instance.data.functions.render[body[x].function](map, body[x], grade, attributes, hspki);
                                        if (!res.error) {
                                            if (instance.data.consoleLogging) {
                                                console.log("   |");
                                                console.log("   |");
                                                console.log("   |");
                                                console.log("Return value is: ");
                                                console.log(res.value);
                                            }
                                            output += res.value;
                                        }
                                        else {
                                            error += "Hit a problem running Function [" + body[x].function + "]. Error message is [" + res.error + "]";
                                        }
                                    }
                                }
                                catch (error) {
                                    error += "hit error rendering '" + body[x].function + "' function. [Habit: " + map._p_habitID + "]. Payload function is " + body[x] + ". Error message is [" + error + "]";
                                }


                            }

                        }

                    }
                    if (instance.data.consoleLogging) {
                        console.log("Return value");
                        console.log({
                            value: output,
                            error: error
                        });
                        console.log("____________________");
                        console.log("   |")
                        console.log("   |")
                    }

                    return {
                        value: output,
                        error: error
                    };

                }

            }
        };

        instance.data.attributesMethod = function (properties) {

            try {

                var attributes_library_reference = properties.attributes_library_reference.get(0, properties.attributes_library_reference.length());
                var attributes_library_name = properties.attributes_library_name.get(0, properties.attributes_library_name.length());
                var attributes_library_type = properties.attributes_library_type.get(0, properties.attributes_library_type.length());
                var attributes_library_subtype = properties.attributes_library_subtype.get(0, properties.attributes_library_subtype.length());


            }
            catch (err){
                instance.data.sendLogglyError("error", null , `Hit an unhandled error building Attributes library\n[ARGUMENTS]\n(properties)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['library','instance.data.attributesMethod','initialize','habitude-main']);
            }

            var library = [];
            attributes_library_reference.forEach((atr, ind) => {
                library.push({
                    reference: atr,
                    name: attributes_library_name[ind],
                    type: attributes_library_type[ind],
                    subtype: attributes_library_subtype[ind]
                })
            });


            try {
                var hasSharedInformation = properties.shared_information_reference && properties.shared_information_name && properties.shared_information_type;

                var shared_information_reference = properties.shared_information_reference.get(0, properties.shared_information_reference.length());
                var shared_information_name = properties.shared_information_name.get(0, properties.shared_information_name.length());
                var shared_information_type = properties.shared_information_type.get(0, properties.shared_information_type.length());
                var shared_information_subtype = properties.shared_information_subtype.get(0, properties.shared_information_subtype.length());

                shared_information_reference.forEach((atr, ind) => {
                    library.push({
                        reference: atr,
                        name: shared_information_name[ind],
                        type: shared_information_type[ind],
                        subtype: shared_information_subtype[ind]
                    })
                });
            }

            catch (err){
                //instance.data.sendLogglyError("error", null , `Hit an unhandled error building Shared Info library\n[ARGUMENTS]\n(properties)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['library','instance.data.attributesMethod','initialize','habitude-main']);
            }

            return library;
        }

        instance.data.warnings = {
            library: [],
            list: [],
            previous: [],
            buildLibrary: function (properties) {

                if (instance.data.warnings.library.length > 0) return;

                try {

                    var warningCodes = properties.warning_library_codes.get(0, properties.warning_library_codes.length());
                    var warningIds = properties.warning_library_ids.get(0, properties.warning_library_ids.length());


                    warningCodes.forEach(function (warning, index) {
                        instance.data.warnings.library.push({
                            code: warningCodes[index],
                            id: warningIds[index]
                        })
                    });

                    //console.log("Finished compiling library");
                    //console.log(instance.data.warnings.library);
                }

                catch (err) {
                    instance.data.warnings.library = [];
                    //console.log(err);
                    //maybe we add something here.
                    //try / catch just in case .get() doesn't play nicely
                }
            },
            addWarning: function (warningCode, stepId, tag) {

                try {

                    if (instance.data.consoleLogging){
                        console.log("Adding a warning");
                        console.log("Code: ", warningCode);
                        console.log("Step: ", stepId);
                        console.log();
                        console.log("Library");
                        console.log(instance.data.warnings.library);
                    }

                    let warning = instance.data.warnings.library.find(function (warning) {
                        return warning.code === warningCode;
                    })

                    if (!warning) return;

                    instance.data.warnings.list.push({
                        _p_stepId: stepId,
                        _p_warning: warning.code,
                        _p_tag: tag
                    });

                    /*
                    //check if there is already an object created for this Step
                    let stepInWarningsArr = instance.data.warnings.list.find(function (warningEntry) {
                        return warningEntry.stepId === stepId;
                    })

                    if (itemInWarningsArr) {

                        var warningNotDuplicate = itemInWarningsArr.warnings.indexOf(warning) < 0;
                        if (warningNotDuplicate) itemInWarningsArr.warnings.push(warning);
                    }
                    else instance.data.warnings.list.push({
                        stepId: stepId,
                        warning: warning,
                        tag: tag
                    });
                    */

                }

                catch (err) {
                    instance.data.sendLogglyError("error", null , `Hit an unhandled error adding a warning\n[ARGUMENTS]\n(warningCode, stepId)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['library','instance.data.warnings.addWarning','habitude-main']);

                    if (instance.data.consoleLogging){
                        console.log(`[addWarning] Hit an issue adding a warning to the warnings list`)
                    }
                }
            }
        }


        instance.data.evaluateMap = function (instance, properties) {

            let start = new Date();
            let grades = ['partial', 'full'];



            // Is this fundamentally ok? 
            // also do we have any broken referecnces?
            //

            if (properties.map) {

                /*
                const errorList = instance.data.validateJsonMap(properties.map);
                if (errorList.length !== 0) {

                    instance.data.sendLogglyError("issue", null , `Found an issue in the JSON map before attempting to render it \n\n[MESSAGES FROM instance.data.validateJsonMap]\n${JSON.stringify(errorList)}\n[ARGUMENTS]\n(instance, properties)\n${JSON.stringify(arguments)}\n`, ['library','instance.data.evaluateMap','habitude-main']);

                    //console.log("We found error level messages in the map. validateJsonMap() has looked after reporting to loggly (WIP).\n\n" + JSON.stringify(errorList, null, 4));

                    return;
                }
                */

                instance.data.frontendWarnings = ["Starting a new warning list."];
                instance.data.warnings.list = [];

                var payload;
                var payload_rendered;
                var error = "";
                var init = false;
                let map = {};
                let hspki = {
                    habit: null,
                    step: null,
                    payload: null,
                    index: null
                };

                try {

                    /**
                 * As we go through the rendering process we're going to make changes to 3 different versions of the map.
                 *
                 * RAW 
                 * -- We'll actually make zero changes to this, it will just be left as it and be pushed 
                 *    back at the end exactly as we find it here.
                 *    It's the baseline / starting point - that's it's only purpose. No changes are made to it at all through
                      rendering
                 * 
                 *
                 * PARTIAL
                 * -- This is the version that we'll be using inside the editor - i.e. not at runtime. 
                 *    Because (presently) there is not any real data flowing 
                 *    through the JSON whilst editing is happening, we're instead going to replace vector references
                 *    to other parts of the habit with editor friendly content. These editor friendly references are
                 *    stored inside the vector mini-JSON payloads.
                 *
                 * FULL
                 * -- This version of the map will be used during runtime as it contains the 'rendered' version
                 *    of the map, meaning we have swapped out vector references to values elsewhere in the map, to
                 *    to the actual values found in those locations.
                 */
                    map.raw = JSON.parse(properties.map);
                    map.partial = JSON.parse(properties.map);
                    map.full = JSON.parse(properties.map);

                    //console.log(JSON.stringify(map));

                    hspki.habit = map.raw._p_habitID;

                    instance.data.attributes.library = instance.data.attributesMethod(properties);
                    instance.data.warnings.buildLibrary(properties);
                    //do a check that every attribute belonging to a block of attributes has been declared within the workflow

                    if (properties.action_id) init = true;

                    //console.log(`init is ${init}`);

                    /**
                 * ATTRIBUTES
                 * -- Vector references stored in the map will refer to one of two places: 
                 *
                 *    1) another location INSIDE the map, or
                 *    2) an attribute which won't be found inside the map, but will be provided in a sheet of key/value pairs
                 *       at the point of rendering.
                 *    
                 *    Attributes carry contextual data that is only available right now, and not data that was generated or fetched
                 *    as part of a previous step of the Habit. An obvious example is 'current time & date', but more useful examples
                 *    would be the name of a the checklist task that has just become overdue.
                 *
                 *	  Restrictions on the frontend mean that only attributes that make sense in the context of the current step can
                 *    be used to generate a vector reference. So, a reference to the 'current checklist item' couldn't be added to
                 *    an email step's behaviour.
                 *    
                 *    So that we only have one single source of truth for all of the possible attributes that a vector reference
                 *    might refer to, we store them in the database / option sets and bring them in each time we run this function - below -
                 *    and create an object array at 'instance.data.attributes.library'.
                 *
                 *    Attributes have a public facing name ('name'), an internal reference ('reference'), and a datatype ('type')
                 */


                }

                catch (err) {

                    instance.data.sendLogglyError("error", null , `Hit an unhandled error building the map object at the outset of render\n[ARGUMENTS]\n(instance, properties)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['library','instance.data.evaluateMap','habitude-main']);

                    error += "Hit an issue parsing the Habit's map. Action is " + properties.action_id + ". ";
                }


                if (init) {

                    if (properties.attributes) {
                        try {
                            map.attributes = JSON.parse(properties.attributes);
                        }
                        catch (err) {
                            error += "Hit a parsing error when trying to load attributes.  Attributes are (" + properties.attributes + ").  Error message is " + err + ". ";
                        }

                    }

                    else map.attributes = [];

                    var actionInd;

                    try {
                        //locate the Action in question
                        actionInd = instance.data.findStepIndex(map.raw, properties.action_id, hspki);
                        if (!actionInd.error) actionInd = actionInd.value;

                    }

                    catch (err) {
                        instance.data.sendLogglyError("issue", null , `Hit an unhandled error trying to find the step to render until at the outset of render\n[ARGUMENTS]\n(instance, properties)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['library','instance.data.evaluateMap','habitude-main']);
                        error += "Hit error finding the Action from where the render was initiated [Habit: " + map.raw._p_habitID + "] " + " - Error message is [" + err + "]. ";

                    }

                    console.log("(((Here)))");
                    console.log(`actionInd is`);
                    console.log(actionInd);


                    let validActionIndex = ((actionInd > -1) && (typeof map.raw === "object") && !error);

                    if (!validActionIndex) {
                        //add some error state + error event here
                        console.log("Fatal: Not a valid action index to process. Hint: " + error);
                        console.log("validActionIndex: " + validActionIndex);
                        console.log("-- actionInd: " + actionInd);
                        console.log("-- actionInd > -1: " + (actionInd > -1));
                        console.log("-- typeof map.raw === \"object\":" + (typeof map.raw === "object"));
                        console.log("-- !error: " + (!error));
                        console.log();
                        console.log();
                        return;
                    }


                    if (validActionIndex) {

                        //RENDERS THE CHAIN
                        //loop through each action up to the current one

                        var loopTo = instance.data.isNotEmpty(actionInd) ? actionInd + 1 : map.raw._p_actions.length;

                        //////////////////////////////////
                        //////////////////////////////////
                        //Loop 1 - actions of habit
                        //////////////////////////////////
                        for (var x = 0; x < loopTo; x++) {

                            hspki.step = map.raw._p_actions[x]._p_actionID;

                            var currentStepInLoop = map.raw._p_actions[x];

                            if (properties.logging) {
                                console.log("**");
                                console.log('Action: ', currentStepInLoop._p_actionID);
                                console.log("**");
                                console.log();
                            }
                            //////////////////////////////////
                            //////////////////////////////////
                            //Loop 2 - payloads of action
                            //////////////////////////////////
                            //loop through the payloads of the current action
                            //for (var y = 0; y < currentStepInLoop._p_payload.length; y++) {

                            currentStepInLoop._p_payload.forEach(function (payloadInStep, index, arr) {


                                hspki.payload = payloadInStep._p_ref;

                                if (properties.logging) {
                                    console.log("*****");
                                    console.log("Action > Payload: ", currentStepInLoop._p_actionID + " > " + payloadInStep._p_internalRef + " (" + payloadInStep._p_ref + ")");
                                    console.log("*****");
                                    console.log();
                                }
                                //////////////////////////////////
                                //////////////////////////////////
                                //Loop 3 - keys of payload
                                //////////////////////////////////
                                //now loop through each of the JSON keys help in p
                                for (var key of Object.keys(payloadInStep)) {

                                    hspki.key = key;

                                    if (properties.logging) {
                                        console.log("**********");
                                        console.log("Action > Payload > Key: ", currentStepInLoop._p_actionID + " > " + payloadInStep._p_internalRef + " (" + payloadInStep._p_ref + ") > " + key);
                                        console.log("**********");
                                        console.log();
                                    }

                                    //establish what type of key we're working with
                                    //either an object array is returned, or null, or a string
                                    //if it's an array then we will send off to evaluateArray, otherwise we'll just pass over it
                                    //objects, stringified objects, or stringified arrays will all be turned into arrays


                                    var payloadKeyTypeChecked = instance.data.checkKey(payloadInStep[key]);

                                    //if (payloadKeyTypeChecked.type === "array") console.log(JSON.stringify(payloadKeyTypeChecked));

                                    if (payloadKeyTypeChecked.error) {

                                        //handle error

                                    }

                                    else {

                                        switch (payloadKeyTypeChecked.type) {

                                            case 'stringified_array/evaluate':
                                            case 'stringified_object/evaluate':

                                                grades.forEach(function (grade) {
                                                    let unlinkedArr = JSON.parse(JSON.stringify(payloadKeyTypeChecked.value));
                                                    if (properties.logging) {
                                                        console.log();
                                                        console.log();
                                                        console.log("Sending array to evaluateArray");
                                                        console.log("- - - - - - - -");
                                                        console.log("=> Grade")
                                                        console.log(grade);
                                                        console.log();
                                                        console.log("=> value [comes from key: " + key + "]");
                                                        console.log(JSON.parse(JSON.stringify(unlinkedArr)));
                                                        console.log("   |")
                                                        console.log("   |")
                                                        console.log("   |")
                                                    }

                                                    let evaluatedArr = instance.data.functions.render.evaluateArray(unlinkedArr, map[grade], grade, map.attributes, hspki);

                                                    if (evaluatedArr.error) {
                                                        if (properties.logging) {
                                                            console.log("   |");
                                                            console.log("   |");
                                                            console.log("   |");
                                                            console.log("Returned an error:")
                                                            console.log(evaluatedArr.error);
                                                            console.log();
                                                        }

                                                        error += "[" + evaluatedArr.error + "]";
                                                    }

                                                    else {
                                                        //console.log();
                                                        //console.log("Evaluated array value");
                                                        //console.log(evaluatedArr.value);
                                                        //console.log();
                                                        //writing back to partial grade of map
                                                        map[grade]._p_actions[x]._p_payload[index][key] = evaluatedArr.value;
                                                    }

                                                });

                                                break;

                                            case 'array/evaluate_each':

                                                //console.log("Inside array/evaluate_each case");

                                                grades.forEach(function (grade) {



                                                    payloadKeyTypeChecked.value.forEach(function (arrItem, arrItemIndex) {

                                                        hspki.index = arrItemIndex;

                                                        let unlinkedArr = [JSON.parse(JSON.stringify(arrItem))];
                                                        if (properties.logging) {
                                                            console.log();
                                                            console.log();
                                                            console.log("---|Sending array to evaluateArray [from inside array key]");
                                                            console.log("---|- - - - - - - -");
                                                            console.log("---|=> Grade")
                                                            console.log(grade);
                                                            console.log();
                                                            console.log("---|=> value [comes from key: " + key + "]");
                                                            console.log(unlinkedArr);
                                                            console.log("---|   |")
                                                            console.log("---|   |")
                                                            console.log("---|   |")
                                                        }

                                                        let evaluatedArr = instance.data.functions.render.evaluateArray(unlinkedArr, map[grade], grade, map.attributes, hspki);

                                                        if (evaluatedArr.error) {
                                                            if (properties.logging) {
                                                                console.log("---|   |");
                                                                console.log("---|   |");
                                                                console.log("---|   |");
                                                                console.log("---|Returned an error:")
                                                                console.log(evaluatedArr.error);
                                                                console.log();
                                                            }

                                                            error += "[" + evaluatedArr.error + "]";
                                                        }

                                                        else {
                                                            //console.log();
                                                            //console.log("Evaluated array value");
                                                            //console.log(evaluatedArr.value);
                                                            //console.log();
                                                            //console.log("Its type is: " + typeof evaluatedArr.value)
                                                            map[grade]._p_actions[x]._p_payload[index][key][arrItemIndex] = evaluatedArr.value;
                                                            //else map[grade]._p_actions[x]._p_payload[index][key][arrItemIndex] = "hello";

                                                        }



                                                    });





                                                });

                                                break;


                                            default:
                                                break;

                                                                          }

                                        //console.log(`\nEvaluated every item in the key at grade: ${grade}\nString is:\n${map[grade]._p_actions[x]._p_payload[index][key]}`);

                                    }


                                } //-- loop through each key of payload

                            }) //forEach for each Payload


                        } //loop for each action



                    }


                    map.currentAction = {
                        raw: map.raw._p_actions[actionInd],
                        partial: map.partial._p_actions[actionInd],
                        full: map.full._p_actions[actionInd]
                    };

                    map.frontendWarnings = instance.data.frontendWarnings;


                    // LS TODO - If we are seeing this it means we have NOT caught the error in validate before processing and we probably
                    // have a bug in the holistic rendering code somewhere. So we should carely study anything that emit from here
                    // With validate in place - we should never see this 
                    if (!!error) {

                        map.error = JSON.stringify(error);
                        instance.data.warn(error);

                    }

                    else {

                        return map;

                    }
                } // end of init
            }

        }

        instance.data.validateJsonMap = function (jsonMapStr) {

            let returnMessageList = [];
            let H = 'Not yet set                     ';
            let S = 'Not yet set                     ';
            let P = 'Not yet set';
            let K = 'Not yet set';

            const bookends = /^{.*?}$|^\[.*?\]$/
            const bubbleId = /^\d{5,}x\d{5,}$/

            function pushOnList(message) {
                HSPKI = "H: " + H + " S: " + S + " P: " + P
                if (message !== undefined) {
                    returnMessageList.push(HSPKI + " " + message);
                }
            }

            function validateStepIndexIsCorrect(stepNumber, _p_actionIndex) {
                if (Number.isInteger(_p_actionIndex)) {
                    // is a number
                }
                else {
                    let message = "Value for _p_actionIndex (" + _p_actionIndex + ") is expected to be a Integer but doesn't look like one, value: " + _p_actionIndex + ".";
                    return message;
                }

                if (stepNumber !== _p_actionIndex) {
                    let message = "The step index " + stepNumber + " does not equal the _p_actionIndex (" + _p_actionIndex + ") so must be out of order or wrong.";
                    //console.log(message);
                    return message;
                }
            }

            function validateIsANumber(key, value) {
                if (Number.isInteger(value)) {
                    // is a number
                }
                else {
                    let message = "K: " + key + ", Value for key (" + key + ") is expected to be a Integer but doesn't look like one, value: " + value
                    //console.log(message);
                    return message;
                }
            }

            function validateBubbleId(key, value) {

                if (!key || !value) {
                    return;
                }

                const found = value.match(bubbleId);
                if (found && found.length > 0) {
                    //console.log("We found a Bubble ID as expected");
                }
                else {
                    let message = "K: " + key + ", Value for key (" + key + ") is expected to be a Bubble Id but doesn't look like one, value: " + value
                    console.log(message);
                    return message;
                }
            }

            function validateBookends(key, value) {

                if (!key || !value || !value.match) {
                    return;
                }

                const found = value.match(bookends);
                if (found && found.length > 0) {
                    try {
                        JSON.parse(value);
                    }
                    catch (e) {
                        let message = "K: " + key + ", Value for key (" + key + ") doesn't parse to an object but looks like it is an object, value: " + e + " " + value
                        return message;
                    }

                }

            }

            function validateBuilderRefContainsRef(builderRef, ref) {
                K = builderRef;
                if (!builderRef) {
                    return;
                }
                if (builderRef === '' || builderRef === null) {
                    let message = "K: builderRef, Value for builderRef (" + builderRef + ") seems to be empty for reference (" + ref + ").";
                    return message;
                }
                if (!ref) {
                    let message = "K: ref is missing (not declared in the JSON) for builderRef (" + builderRef + ").";
                    return message;
                }
                if (!ref || ref === '' || ref === null) {
                    let message = "K: ref, Value for ref (" + ref + ") seems to be empty for builderRef (" + builderRef + ").";
                    return message;
                }
                if (builderRef.startsWith(ref + '/')) {
                    // we found the ref as expected
                }
                else {
                    let message = "K: builderRef, Value for builderRef (" + builderRef + ") doesn't start with ref (" + ref + ")";
                    return message;
                }
            }

            // Main 
            try {
                const dataObj = JSON.parse(jsonMapStr);
                const H = dataObj._p_habitID;
                pushOnList(validateBubbleId("_p_habitID", dataObj._p_habitID));

                const stepArr = dataObj._p_actions;
                let stepNumber = 0;
                stepArr.forEach(function (step) {
                    stepNumber++;
                    pushOnList(validateStepIndexIsCorrect(stepNumber, step._p_actionIndex));
                    pushOnList(validateBubbleId("_p_actionID", step._p_actionID));
                    pushOnList(validateBubbleId("_p_lookupID", step._p_lookupID));
                    pushOnList(validateIsANumber("_p_actionIndex", step._p_actionIndex));

                    S = step._p_actionID;

                    let payloadArr = step._p_payload;

                    payloadArr.forEach(function (payload) {
                        P = payload._p_ref;

                        pushOnList(validateBuilderRefContainsRef(payload._p_builderRef, payload._p_ref));

                        pushOnList(validateBookends("_p_externalRef", payload._p_externalRef));
                        pushOnList(validateBookends("_p_bubbleObj", payload._p_bubbleObj));
                        pushOnList(validateBookends("_p_valueText", payload._p_valueText));
                        pushOnList(validateBookends("_p_valueNumber", payload._p_valueNumber));
                        pushOnList(validateBookends("_p_valueDate", payload._p_valueDate));

                        // For when we want to validate more payload key/values
                        /*
                                for (const [key, value] of Object.entries(payload)) {
                                    let valueStr = JSON.stringify(value);
                                    K = key;
                                }
                                */
                    })
                })


            } catch (err) {
                if (err instanceof SyntaxError) {
                    pushOnList("We couldn't not parse the JSON map, " + err.name + ': ' + err.message);
                }
                else {
                    // Unexpected exception validating the json map
                    // means either validation is wrong (very bad) OR validation is incomplete (quite bad)
                    // In any case we want to know and correct quickly - but we will let it pass through
                    // as maybe it is handled down the line
                    console.error(err);
                    console.log(err);
                }
            }
            finally {
                if (returnMessageList.length !== 0) {
                    hspki = {};
                    hspki.H = H;
                    hspki.S = S;
                    hspki.P = P;
                    hspki.K = K;
                    //console.log("This is what we are reporting to loggly: " +  JSON.stringify(hspki, null,4) + "\n\n" +  JSON.stringify(returnMessageList, null,4) )
                    instance.data.sendLogglyError('error', hspki, JSON.stringify(returnMessageList, null, 4));
                }
            }

            return returnMessageList;
        }

        // This is used for library code to emit log events. 
        // It's purpose is so the library code will funtion identically both for CSA and SSA
        // So we know it works it is used also by the specific CSA and SSA logging actions.
        instance.data.sendLogglyError = function (level, hspki, message, tags) {

            try {
                // Tests if browser, this returns browser if true, else returns false. 
                const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
                // Assign new object to data and append message and level.
                const data = {};
                data.message = message;
                data.level = level;

                if (hspki) {
                    for (const [key, value] of Object.entries(hspki)) {
                        let is_object = typeof data[key] === 'object';
                        data[key] = is_object ? JSON.stringify(value) : String(value);
                    }
                };

                var tagArray = [];

                if (Array.isArray(tags)) {
                    tags.forEach(function(tag){
                        tagArray.push(JSON.stringify(tag));
                    })
                };

                if (tagArray.length > 0) data.tags = tagArray;

                const logzioUrl 	= context.keys['logz.io URL']; 
                //const logzioUrl 	= "https://listener-uk.logz.io";
                const logzioToken 	= context.keys['logz.io token'];
                //const logzioToken 	= "GmUpKaQVvghvpSLsMYxzPhWNuYTNLwka";

                if (isBrowser()) {
                    if (instance.data.consoleLogging){
                        console.log(`***ISSUE***\n${message}\n${JSON.stringify(hspki)}`);
                    }
                    //console.log("We think we are on the client so using the client log methods.");
                    var options = {
                        logzioUri: logzioUrl + "?token=" + logzioToken
                    };
                    window.Logzio.track(data, options);
                }
                else { // We assume we are on the server
                    //console.log("We think we are NOT on the client so using the server log methods.");

                    if (!message) {
                        return;
                    }

                    let uri = logzioUrl+'/?token='+logzioToken;

                    let debug = uri;  


                    const options = {'uri': uri, 
                                     'method': 'POST', 
                                     'rejectUnauthorized': false, 
                                     'strictSSL': false, 
                                     'followRedirect': true, 
                                     'timeout': 20000 ,
                                     'headers': {  "Accept": "application/json, text/plain, */*",
                                                 "User-Agent": "axios/0.18.0",
                                                 "Content-type": 'content-type:application/json'},
                                     'body': JSON.stringify(data)
                                    };

                    debug += "\n" + JSON.stringify(options);
                    //console.log(options.body)

                    try {
                        //context.request(options, function (error, response, body){
                        //console.log('error:',error);
                        //console.log('status code:', response && response.statusCode);
                        //console.log('body:', body);
                        //});
                        // var statusCode = response.statusCode;
                        //debug += "\n"+ response.body;
                        //console.log(response);
                        //var results = JSON.stringify(response.body);
                        //console.log(results);

                    } catch (e) {
                        debug += "\n"+JSON.stringify(e);
                        console.log(e);
                    }

                }
            }

            catch (err){

            }

        }


    }
    //END
}