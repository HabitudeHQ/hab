var window = {};

//CS FUNCTIONS ONLY
//START
if (!window.habitude) window.habitude = {};
if (!window.habitude.main) window.habitude.main = {
    maps: {
        raw: null,
        partial: null,
        full: null
    },
    methods: {

        publishAll: function () {
            this.instanceArray.forEach(fn => fn());
        },
        instanceArray: []

    }
};

const publish = function () {

    try {

        console.log(`publishing map_raw`);
        console.log(window.habitude.main.maps.raw);
        instance.publishState("map_raw", window.habitude.main.maps.raw);
        //instance.publishState("map_partial", window.habitude.main.maps.partial);
        //instance.publishState("map_full", window.habitude.main.maps.full);
    }
    catch (err) {
        console.error(err);
    }

};

window.habitude.main.methods.instanceArray.push(publish);

if (!window.habitude.base) {

    window.habitude.base = {};

    window.habitude.base.guid = function (length) {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        var randomString = "";

        for (var loop = 0; loop < length; loop++) {
            if (loop > 0) randomString += '-';
            randomString += s4();
        }

        return randomString;
    }


    window.habitude.base.update = function (instance, properties) {

        // Define global variables
        var error = "";
        var actionInd, action;
        var workloadArr = [];

        const processValue = (value, workloadObj) => {

            if (!properties.translate_as_vector) return value;
            if (workloadObj.type !== "map_raw") return value;

            let responseValue;

            //console.log("This is what we are about to return from processValue() method");
            //console.log(window.habitude.base.functions.vectoriseText(value, workloadObj.map));

            if (!Array.isArray(value)) {
                responseValue = window.habitude.base.functions.vectoriseText(value, workloadObj.map);
                if (typeof responseValue !== "string") responseValue = JSON.stringify(responseValue);
            }
            else {
                responseValue = value.map((arrItem) => {
                    let tempValue = window.habitude.base.functions.vectoriseText(value, workloadObj.map);
                    if (typeof tempValue !== "string") tempValue = JSON.stringify(tempValue);
                    return tempValue;
                });
            }

            if (properties.logging) console.log(`[window.habitude.base.update/processValue]\nabout to return value:\n${JSON.stringify(responseValue)}`);

            return responseValue;

        }

        const handleUpdate = function (workloadArrItem, index) {

            var payload = workloadArrItem.payloadObj;

            if (window.habitude.base.isNotEmpty(properties.value_text)) {
                if (properties.value_text === "***||1||***")
                    payload._p_valueText = null;
                else payload._p_valueText = processValue(properties.value_text, workloadArrItem);
            }

            if (window.habitude.base.isNotEmpty(properties.internal_ref)) {
                if (properties.internal_ref === "***||1||***")
                    payload._p_internalRef = null;
                else payload._p_internalRef = properties.internal_ref;
            }

            if (window.habitude.base.isNotEmpty(properties.value_number)) {
                if (properties.value_number === -999999)
                    payload._p_valueNumber = null;
                else payload._p_valueNumber = properties.value_number;
            }

            if (window.habitude.base.isNotEmpty(properties.value_date)) {
                if (properties.value_date === "***||1||***")
                    payload._p_valueDate = null;
                else payload._p_valueDate = properties.value_date;
            }

            if (window.habitude.base.isNotEmpty(properties.completed)) {
                payload._p_completed = properties.completed;
            }

            if (window.habitude.base.isNotEmpty(properties.external_ref)) {
                //wipe the key's value if it's ***/1/***
                if (properties.external_ref === "***||1||***")
                    payload._p_externalRef = null;
                else payload._p_externalRef = properties.external_ref;
            }

            if (window.habitude.base.isNotEmpty(properties.builder_ref)) {
                if (properties.builder_ref === "***||1||***")
                    payload._p_builderRef = null;
                else
                    payload._p_builderRef = properties.builder_ref;
            }

            if (window.habitude.base.isNotEmpty(properties.type)) {
                if (properties.type === "***||1||***") payload._p_type = null;
                else payload._p_type = properties.type;
            }

            if (window.habitude.base.isNotEmpty(properties.bubble_obj)) {
                if (properties.bubble_obj === "***||1||***")
                    payload._p_bubbleObj = null;
                else payload._p_bubbleObj = processValue(properties.bubble_obj, workloadArrItem);
            }

            //handle lists
            try {
                var list = [];
                if (properties.value_text_list && properties.value_text_list.get) {
                    list = properties.value_text_list.get(0, properties.value_text_list.length()
                    );

                    if (list[0] === "***||1||***") payload._p_listText = [];
                    else payload._p_listText = processValue(list, workloadArrItem);
                }

                if (properties.value_date_list && properties.value_date_list.get) {
                    list = properties.value_date_list.get(0, properties.value_date_list.length());

                    if (list[0] === "***||1||***") payload._p_listDate = [];
                    else payload._p_listDate = processValue(list, workloadArrItem);
                }

                if (
                    properties.value_number_list &&
                    properties.value_number_list.get
                ) {
                    list = properties.value_number_list.get(
                        0,
                        properties.value_number_list.length()
                    );

                    if (list[0] === -999999) payload._p_listNumber = [];
                    else payload._p_listNumber = list;
                }
            } catch (err) {
                if (logging) console.error(`Error updating payload: ${payload}: ${err}`);
            }

            if (!properties.direct) {

                instance.publishState(`${workloadArrItem.type}_stringified`, JSON.stringify(workloadArrItem.map));
                if (properties.do_save) instance.triggerEvent(`save_${workloadArrItem.type}`, (err) => { });
                if (logging) console.log(`Just published ${workloadArrItem.type}_stringified\n`);
                if (logging) console.log(JSON.stringify(workloadArrItem.map));

            }

            else {

                //window.habitude.main.maps.raw = workloadArrItem.map;
                console.log("about to go and publish");
                window.habitude.main.methods.publishAll();
                //console.log(window.habitude.main.maps);

            }

        };

        var logging = properties.logging;
        if (logging) console.log(`[window.habitude.base.update]\nProperties\n${JSON.stringify(properties)}`);

        try {

            if (!properties.action_id) throw new Error("[window.habitude.base.update]\nNo action_id was provided when attempting to update a payload");
            if (!properties.payload_id) throw new Error("[window.habitude.base.update]\nNo payload_id was provided when attempting to update a payload");
            if (!properties.map_1) throw new Error("[window.habitude.base.update]\nAt least one map needs to be provided when updating a payload");


            // 1. Take in maps - could be more than one - assign to an array called maps
            //build the object array that we're going to iterate through
            for (var mapCount = 1; mapCount < 3; mapCount++) {

                let mapType = properties[`updating_${mapCount}`];
                if (mapType === 'map') mapType = 'map_raw';

                let thisMap;

                if (!properties.direct) {
                    thisMap = properties[`map_${mapCount}`];

                    console.log(`thisMap`);
                    console.log(thisMap);

                    if (!thisMap) continue;

                    let thisMapAsObj = typeof thisMap === 'string' ? JSON.parse(thisMap) : thisMap;

                    let payloadParent;

                    if (!mapType || mapType.indexOf('map') > -1) {

                        if (properties.action_id === "workflow") payloadParent = thisMapAsObj._p_workflowPayloads;
                        else {
                            payloadParent = thisMapAsObj._p_actions.find((action) => { return action._p_actionID === properties.action_id; });
                            if (!payloadParent) throw new Error(`No action found when looking for ${properties.action_id} in map with id: ${thisMapAsObj._p_habitID}`);
                            else payloadParent = payloadParent._p_payload;
                        }

                        if (logging) console.log(`Here is the payloadParent`);
                        if (logging) console.log(payloadParent);



                    } else {
                        payloadParent = thisMapAsObj._p_payload;
                    }

                    //console.log("thisMapAsObj");
                    //console.log(thisMapAsObj);

                    var payloadObj = payloadParent.find((payload) => {
                        return payload._p_ref === properties.payload_id;
                    });

                    //console.log("paylondObj is ");
                    //console.log(payloadObj);

                    if (!payloadObj) throw new Error(`No payload found when looking for ${properties.payload_id} inside action: ${properties.action_id} inside map with id: ${thisMapAsObj._p_habitID}`);

                    handleUpdate({
                        map: thisMapAsObj,
                        payloadObj: payloadObj,
                        type: mapType ? mapType : 'map_raw',
                        output: null
                    }, mapCount);


                }

                else if (properties.direct) {

                    let step_index = window.habitude.main.maps.raw._p_actions.findIndex(action => action._p_actionID === properties.action_id);
                    let payload_index = window.habitude.main.maps.raw._p_actions[step_index]._p_payload.findIndex(payload => payload._p_ref === properties.payload_id);

                    console.log(`\nstep_index: ${step_index}\npayload_index: ${payload_index}`);

                    handleUpdate({
                        map: window.habitude.main.maps.raw,
                        payloadObj: window.habitude.main.maps.raw._p_actions[step_index]._p_payload[payload_index],
                        type: mapType ? mapType : 'map_raw',
                        output: null
                    }, mapCount);

                    switch (mapType) {

                        case 'workflow':
                            thisMap = window.habitude.main.maps.raw._p_workflowPayloads;
                            break;

                        case 'action_raw':
                            thisMap = window.habitude.main.maps.raw._p_actions.find(action => action._p_actionID === properties.action_id);
                            break;

                        case 'action_full':
                            thisMap = window.habitude.main.maps.full._p_actions.find(action => action._p_actionID === properties.action_id);
                            break;

                        case 'map_raw':
                        default:
                            console.log("^^inside map_raw^^")
                            thisMap = window.habitude.main.maps.raw;
                            break;

                    }

                }



                /*
                workloadArr.push({
                    map: thisMapAsObj,
                    payloadObj: payloadObj,
                    type: mapType ? mapType : 'map_raw',
                    output: null
                });
                */

            }

        }
        catch (err) {
            console.error(`Error setting up maps array: ${err}`);
        }

        try {

            // Handle map and action instances -> assign action and payload.

        }

        catch (err) {

            console.error(err);

        }
    };

    window.habitude.base.build_json_packet = function (instance, properties, context) {
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

                catch (err) {
                    console.log(`Hit error parsing properties.existing_json`);
                }
            }

            try {
                //check if we're using key_dictionary, and fetch it if so
                if (properties.use_dictionary && properties.dictionary_index > -1 && properties.key_dictionary.length() > 0) {
                    properties.use_dictionary = true;
                    window.habitude.base.key_dictionary = properties.key_dictionary.get(0, properties.key_dictionary.length());
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
            if (window.habitude.base.isNotEmpty(properties.function)) obj.function = properties.function;

            //if there's no `function` key on the object then we're going to add a blank one
            else if (window.habitude.base.isEmpty(obj.function)) obj.function = null;

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
            if (window.habitude.base.isNotEmpty(properties.provider_name)) obj.params.provider_name = properties.provider_name;

            //if there's no `provider_name` key on the object then we're going to add a blank one
            else if (window.habitude.base.isEmpty(obj.params.provider_name)) obj.params.provider_name = null;

            else {
                //here, there was no `provider_name` key / value given, but there was one pre-exisitng - so we're going to leave that be
            }

            //**PARAMS.action**//
            //a `action` key / value as been provided
            if (window.habitude.base.isNotEmpty(properties.action)) obj.params.action = properties.action;

            //if there's no `action` key on the object then we're going to add a blank one
            else if (window.habitude.base.isEmpty(obj.params.action)) obj.params.action = null;

            else {
                //here, there was no `action` key / value given, but there was one pre-exisitng - so we're going to leave that be
            }

            //**PARAMS.provider_category**//
            //a `provider_category` key / value as been provided
            if (window.habitude.base.isNotEmpty(properties.provider_category)) obj.params.provider_category = properties.provider_category;

            //if there's no `provider_category` key on the object then we're going to add a blank one
            else if (window.habitude.base.isEmpty(obj.params.provider_category)) obj.params.provider_category = null;

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

                properties.valueText.forEach(function (item, index) {
                    //if data has been provided against the key, we'll use that
                    key = window.habitude.base.getKey(item.key, properties.use_dictionary, window.habitude.base.key_dictionary, properties.dictionary_index);
                    //("Key is: ", key);

                    if (window.habitude.base.isNotEmpty(item.value)) {

                        obj.params.data[key] = window.habitude.base.prepareValue(item.value, properties.isStringified);

                        if (properties.vectorise) {
                            obj.params.data[key] = window.habitude.base.functions.vectoriseText(obj.params.data[key], properties.map);
                        }
                    }

                    //if there is no key created yet, then we'll create it & set it to null
                    else if (obj.params.data[item.key] === undefined) {

                        obj.params.data[key] = null;
                    }

                    else if (window.habitude.base.isEmpty(item.value) && window.habitude.base.isNotEmpty(obj.params.data[key])) {
                        obj.params.data[key] = null;
                    }

                    else {
                        //we'll just leave it be - there must be something already in here
                    }
                });
            }


            if (properties.valueDate.length > 0) {

                properties.valueDate.forEach(function (item, index) {

                    key = window.habitude.base.getKey(item.key, properties.use_dictionary, window.habitude.base.key_dictionary, properties.dictionary_index);

                    if (window.habitude.base.isNotEmpty(item.value)) {
                        obj.params.data[key] = window.habitude.base.prepareValue(item.value, properties.isStringified);
                    }

                    //if there is no key created yet, then we'll create it & set it to null
                    else if (obj.params.data[key] === undefined) {
                        obj.params.data[key] = null;
                    }

                    else if (window.habitude.base.isEmpty(item.value) && window.habitude.base.isNotEmpty(obj.params.data[key])) {
                        obj.params.data[key] = null;
                    }

                    else {
                        //we'll just leave it be - there must be something already in here
                    }
                });
            }

            if (properties.valueNumber.length > 0) {

                properties.valueNumber.forEach(function (item, index) {

                    key = window.habitude.base.getKey(item.key, properties.use_dictionary, window.habitude.base.key_dictionary, properties.dictionary_index);

                    if (window.habitude.base.isNotEmpty(item.value)) {
                        var number = isNaN(Number(item.value)) || window.habitude.base.isEmpty(item.value) ? null : Number(item.value);
                        obj.params.data[key] = number;
                    }
                    else if (obj.params.data[key] === undefined) {
                        obj.params.data[key] = null;
                    }

                    else if (window.habitude.base.isEmpty(item.value) && window.habitude.base.isNotEmpty(obj.params.data[key])) {
                        obj.params.data[key] = null;
                    }

                    else {
                        //we'll just leave it be - there must be something already in here
                    }
                });
            }

            if (properties.listText.length > 0) {

                properties.listText.forEach(function (item, index) {

                    key = window.habitude.base.getKey(item.key, properties.use_dictionary, window.habitude.base.key_dictionary, properties.dictionary_index);

                    if (window.habitude.base.isNotEmpty(item.value)) {
                        array = item.value.split('|^^|');

                        var arrayPrepared = array.map(itemValue => window.habitude.base.prepareValue(itemValue, properties.isStringified));

                        //because rendering resolves arrays to strings, we need to nest actual arrays inside another array.
                        arrayPrepared.forEach(function (item, index) {
                            var itemForArray;
                            if (properties.vectorise) itemForArray = window.habitude.base.functions.vectoriseText(item, properties.map);
                            else itemForArray = item;
                            if (Array.isArray(itemForArray)) arrayPrepared[index] = itemForArray;
                            else arrayPrepared[index] = [itemForArray];
                        });

                        //console.log(arrayPrepared);

                        obj.params.data[key] = arrayPrepared;

                    }

                    //we've been provided a blank value and this is the first time we've seen this key - so we'll just create the key
                    else if (obj.params.data[key] === undefined) {
                        obj.params.data[key] = [];
                    }

                    //there's a value already in the object but now we're receiving a blank - we're going to clear out that existing value
                    else if (window.habitude.base.isEmpty(item.value) && window.habitude.base.isNotEmpty(obj.params.data[key])) {
                        obj.params.data[key] = [];
                    }

                    else {
                        //we'll just leave it be - there must be something already in here
                    }
                });
            }

            if (properties.listDate.length > 0) {

                properties.listDate.forEach(function (item, index) {

                    key = window.habitude.base.getKey(item.key, properties.use_dictionary, window.habitude.base.key_dictionary, properties.dictionary_index);

                    if (window.habitude.base.isNotEmpty(item.value)) {
                        array = item.value.split('|^^|');
                        var arrayPrepared = array.map(itemValue => window.habitude.base.prepareValue(itemValue, properties.isStringified));

                        //console.log(`Key is ${key}`);
                        //console.log("List of texts is\n",arrayPrepared);
                        obj.params.data[key] = arrayPrepared;
                        //console.log(obj.params.data[key]);

                    }

                    else if (obj.params.data[key] === undefined) {
                        obj.params.data[key] = [];
                    }

                    //there's a value already in the object but now we're receiving a blank - we're going to clear out that existing value
                    else if (window.habitude.base.isEmpty(item.value) && window.habitude.base.isNotEmpty(obj.params.data[key])) {
                        obj.params.data[key] = [];
                    }

                    else {
                        //we'll just leave it be - there must be something already in here
                    }

                });
            }

            if (properties.listNumber.length > 0) {

                properties.listNumber.forEach(function (item, index) {

                    key = window.habitude.base.getKey(item.key, properties.use_dictionary, window.habitude.base.key_dictionary, properties.dictionary_index);

                    if (window.habitude.base.isNotEmpty(item.value)) {
                        array = item.value.split('|^^|');
                        array.forEach(function (maybeNumber, index) {
                            var cleanNumber = isNaN(Number(maybeNumber)) || window.habitude.base.isEmpty(maybeNumber) ? null : Number(maybeNumber);
                            array[index] = cleanNumber;
                        });
                        obj.params.data[key] = array;
                    }
                    else if (obj.params.data[key] === undefined) {
                        obj.params.data[key] = [];
                    }

                    //there's a value already in the object but now we're receiving a blank - we're going to clear out that existing value
                    else if (window.habitude.base.isEmpty(item.value) && window.habitude.base.isNotEmpty(obj.params.data[key])) {
                        obj.params.data[key] = [];
                    }

                    else {
                        //we'll just leave it be - there must be something already in here
                    }

                });
            }



            return {
                jsonPacket: JSON.stringify(obj),
                error: error
            }


        }

        catch (err) {

            console.error(err);

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

// generally defaults to off 
window.habitude.base.consoleLogging = false;

/** 
 * LS I expect these will be reused and refactored a lot to give deep insight and trend with loggly
 * DEBUG So log messages can be consistently formError message isated and optionally sent to Loggly
 */

window.habitude.base.getKey = function (item_key, use_dictionary, key_dictionary, dictionary_index) {
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

window.habitude.base.prepareValue = function (value, isStringified) {

    //if (!isStringified) return value;

    var forReturn;
    try {
        forReturn = JSON.parse(value);
    }
    catch (err) {
        forReturn = value;
    }

    return forReturn;
}

window.habitude.base.log = function (s1, s2) {
    let message;
    if (window.habitude.base.consoleLogging) {
        message = (new Date().getTime() + "").padEnd(16);
        if (s1) { message += (s1 + "").padEnd(60) }
        if (s2) { message += (s2 + "").padEnd(30) }
        if (logging) console.log(message);
    }

    // TODO - also pump off messages to loggly - with elapsed time so we can monitor degradation
    // Want to be able to manage  console & loggly separately

}

window.habitude.base.arraysEqual = function (a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    a.sort(function (a, b) {
        return a - b;
    });

    b.sort(function (a, b) {
        return a - b;
    });


    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

window.habitude.base.warn = function (s1, s2) {
    let message;
    if (window.habitude.base.consoleLogging) {
        message = (new Date().getTime() + "").padEnd(16);
        if (s1) { message += (s1 + "").padEnd(60) }
        if (s2) { message += (s2 + "").padEnd(30) }
        console.warn(message);
    }

    // TODO - also pump off messages to loggly

}

window.habitude.base.isEmpty = function (property) {
    //Simple function to check if a value is empty or not - differs from ! because 0 will not show as empty using this

    if (property === '' || property === null || property === undefined) return true;
    else return false;
}

window.habitude.base.isNotEmpty = function (property) {
    //as above, but the opposite

    if (property === '' || property === null || property === undefined) return false;
    else return true;
}

window.habitude.base.makeId = function (length) {
    //returns a UID of n length
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
};

window.habitude.base.scrambleIds = function (action) {
    //used when payload template JSON is added into a Habit to randomise the _p_ref of that payload to make sure there are no clashes with other payloads

    action._p_payload.forEach((payload, p_ind) => {

        action._p_payload[p_ind]._p_ref = window.habitude.base.makeId(10);
        if (action._p_payload[p_ind]._p_builderRef) {

            var builderRefSplit = action._p_payload[p_ind]._p_builderRef.split("/");

            action._p_payload[p_ind]._p_builderRef = builderRefSplit.length > 1 ?
                action._p_payload[p_ind]._p_ref + "/" + builderRefSplit[1] :
                action._p_payload[p_ind]._p_ref + "/" + builderRefSplit[0];

        }
    });

    return action;
}

window.habitude.base.findStepIndex = function (map, stepId, hspki) {

    var error = "";
    var index;

    var keyCandidates = ["_p_actionID", "_p_lookupID"];
    //_p_actionID
    //_p_lookupID

    var found = false;

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
    }

    //console.log("Index: ", index);


    return {
        value: index,
        error: error
    };

}

window.habitude.base.findPayloadIndex = function (map, payloadRef, actionIndex, hspki) {
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



        // EB TODO format the warnings appropriately
        window.habitude.base.frontendWarnings.push(warning);
        // add to a list of warnings ^^[]{}
    }

    return {
        value: index,
        error: error
    }
}

window.habitude.base.checkKey = function (keyValue, hspki) {
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

window.habitude.base.attributes = {
    library: []
};

window.habitude.base.attributes.update = function (objArr, type, attributes) {
    var error;

    objArr.forEach(obj => {
        var ind = attributes.findIndex(a => a.reference === obj.key);
        if (ind > -1) {
            attributes[ind][type] = obj.value;
        }
        else {
            var atrInd = window.habitude.base.attributes.library.findIndex(atr => atr.reference === obj.key);
            if (atrInd > -1) {
                var atr = window.habitude.base.attributes.library[atrInd];
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

window.habitude.base.functions = {

    vectoriseText: function (body, map) {

        if (window.habitude.base.consoleLogging) console.log(`***INSIDE VECTORISE***`);
        if (window.habitude.base.consoleLogging) console.log(`body is:\n${body}\n\nmap is:\n${map}`);

        try {

            if (!body) return body;
            if (typeof body !== 'string') return body;

            //collect all of the tags into an array
            var textSplitByTags = window.habitude.base.isNotEmpty(body) ? body.match(/{{.*?\}}/g) : null;

            var toBeProcessed = body;
            var beenProcessed = []; //everything will be pushed from a across to b

            if (textSplitByTags === null) {
                if (window.habitude.base.isNotEmpty(toBeProcessed)) beenProcessed.push(toBeProcessed);
                else beenProcessed.push("");
                return beenProcessed.join();
            }

            for (var thisSplitIndex = 0; thisSplitIndex < textSplitByTags.length; thisSplitIndex++) {
                //push all vanilla text left of the tag from toBeProcessed into beenProcessed
                var indexOfThisTagStart = toBeProcessed.indexOf(textSplitByTags[thisSplitIndex]);
                var textLeftOfTag = toBeProcessed.substring(0, indexOfThisTagStart);
                if (textLeftOfTag !== "") {
                    beenProcessed.push(textLeftOfTag);
                }

                //remove everything left of the text from toBeProcessed
                toBeProcessed = toBeProcessed.substring(indexOfThisTagStart, toBeProcessed.length);

                //push the tag from b into a
                if (textSplitByTags[thisSplitIndex]) {
                    var tag = textSplitByTags[thisSplitIndex].replaceAll('{{', '').replaceAll('}}', '')

                    //var tagSplit = tag.split('/');
                    var tagSplit = tag.split('^_');
                    var tagType = tagSplit[6];

                    tagSplit = tagSplit.map((partOfTag) => {
                        if (partOfTag === "null") return null;
                        else return partOfTag;
                    });

                    var returnObj;

                    //tag types are:
                    //   - t: a merge tag, a reference to another piece of data stored elsewhere in the process
                    //   - a: attribute tag, a reference to a piece of live or global context brought in from runtime
                    //   - c: contact tag, a reference to a contact within the tenancy

                    switch (tagType) {

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
                    if (window.habitude.base.consoleLogging) console.log(`beenProcessed array is now:\n${JSON.stringify(beenProcessed)}`);
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

            console.error(err);
        }


        //VECTORISE FUNCTIONS
        function createMergeTag(toFind, map) {

            if (!toFind) throw new Error("No tag information was given when trying to create a tag reference object.");

            if (window.habitude.base.consoleLogging) console.log("Inside createMergeTag()");
            //loop through actions
            var found = false;
            //var expressionSplit = toFind.split('/');
            var expressionSplit = toFind.split('^_'); //changing over to \\ for v2

            //mergeTag syntax is '{{reference / editor message / step index / list index / transformation / parameter / tag type}}';
            var reference = expressionSplit[0] ? expressionSplit[0] : null;
            var editorMessage = expressionSplit[1] ? expressionSplit[1] : null;
            var stepIndex = expressionSplit[2] ? expressionSplit[2] : null;
            var listIndex = expressionSplit[3] ? expressionSplit[3] : null;
            var transformation = expressionSplit[4] ? expressionSplit[4] : null;
            var defaultValue = expressionSplit[5] ? expressionSplit[5] : null;
            var tagType = expressionSplit[6] ? expressionSplit[6] : null;

            //if this is not an attribute then go find the lookup within the map
            if (tagType === 't') {

                var stepId = reference.split('_')[0];
                var payloadRef = reference.split('_')[1];

                if (window.habitude.base.consoleLogging) console.log("About to return the following tag object from createMergeTag()");
                if (window.habitude.base.consoleLogging) console.log({
                    function: "lookup_single",
                    version: "2",
                    params: {
                        text: toFind,
                        actionRef: stepId,
                        payloadRef: payloadRef,
                        defaultValue: defaultValue,
                        listIndex: listIndex,
                        transformation: transformation,
                        editorReference: editorMessage
                    }
                });

                return {
                    function: "lookup_single",
                    version: "2",
                    params: {
                        text: toFind,
                        actionRef: stepId,
                        payloadRef: payloadRef,
                        defaultValue: defaultValue,
                        listIndex: listIndex,
                        transformation: transformation,
                        editorReference: editorMessage
                    }
                };
            }

            else if (tagType === 'a') {

                if (toFind) {
                    if (window.habitude.base.consoleLogging) console.log("Inside attribute hunt\nAttributes library is\n");
                    if (window.habitude.base.consoleLogging) console.log(window.habitude.base.attributes.library);

                    if (window.habitude.base.consoleLogging) console.log("About to return the following tag object from createMergeTag()");
                    if (window.habitude.base.consoleLogging) console.log({
                        function: "lookup_single",
                        version: "2",
                        params: {
                            text: toFind,
                            actionRef: "#",
                            payloadRef: reference,
                            defaultValue: defaultValue,
                            listIndex: listIndex,
                            transformation: transformation,
                            editorReference: editorMessage,
                            stepIndex: "#"
                        }
                    });

                    return {
                        function: "lookup_single",
                        version: "2",
                        params: {
                            text: toFind,
                            actionRef: "#",
                            payloadRef: reference,
                            defaultValue: defaultValue,
                            listIndex: listIndex,
                            transformation: transformation,
                            editorReference: editorMessage,
                            stepIndex: "#"
                        }
                    };

                }


            }

        };

        function createContactTag(tag) {

            // {{ email / editor text / @ / name / uid / lookup / tag}}
            // {{izzi@habitude.co/I Dorrian/@/Izzi|^^|Dorrian/12345_54321/email/c}}
            //var tagSplit = tag.split('/');
            var tagSplit = tag.split('^_'); //updated for v2

            var email = tagSplit[0] ? tagSplit[0] : null;
            var name = tagSplit[3] ? tagSplit[3] : null;
            var uid = tagSplit[4] ? tagSplit[4] : null;
            var lookupKey = tagSplit[5] ? tagSplit[5] : null;

            return {
                function: 'lookup_contact',
                version: "2",
                params: {
                    text: tag,
                    email: email,
                    name: name,
                    uid: uid,
                    lookupKey: lookupKey
                }
            };
        };

        function createCustomText(tag) {

            // {{ null / custom text / symbol / type / null / null / tag}}
            // {{izzi@habitude.co/I Dorrian/@/Izzi|^^|Dorrian/12345_54321/email/c}}
            //var tagSplit = tag.split('/');
            var tagSplit = tag.split('^_'); //updated for v2

            var customText = tagSplit[1] ? tagSplit[1].replaceAll('&#47;', '/').replaceAll('&#34;', '\"') : null;
            var type = tagSplit[3] ? tagSplit[3] : null;

            var symbol;
            switch (type) {
                case 'email':
                    symbol = '@';
                    break;

                default:
                    symbol = 'null';
                    break;
            };

            //tag = `null/${tagSplit[1]}/${symbol}/${type}/null/null/x`;
            tag = `null^_${tagSplit[1]}^_${symbol}^_${type}^_^_^_x`; //updated for v2

            return {
                function: 'lookup_custom',
                version: "2",
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



                if (window.habitude.base.consoleLogging) {
                    console.log("   |")
                    console.log("   |")
                    console.log("===> window.habitude.base.functions.render.integration")
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

                    if (window.habitude.base.consoleLogging) {
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

                        if (window.habitude.base.consoleLogging) {
                            console.log();
                            console.log("...which is an array");
                        }
                        if (node_value.some(arr_item => Object.prototype.toString.call(arr_item) === '[object Array]')) {

                            //if it does, then we'll evaluateArray each of them in turn
                            node_value.forEach((item, ind) => {

                                if (window.habitude.base.consoleLogging) {
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
                                    let res = window.habitude.base.functions.render.evaluateArray(item, map, grade, attributes, hspki);

                                    if (!res.error) {

                                        if (window.habitude.base.consoleLogging) {
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
                                    && item.function in window.habitude.base.functions.render) {

                                    try {

                                        var res = window.habitude.base.functions.render[node_value.function](map, node_value, grade, attributes, hspki);

                                        if (!(res.error)) {

                                            if (window.habitude.base.consoleLogging) {
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

                            let res = window.habitude.base.functions.render.evaluateArray(node_value, map, grade, attributes, hspki);

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
                        && node_value.function in window.habitude.base.functions.render) {

                        //console.log("And found an object");
                        try {
                            var res = window.habitude.base.functions.render[node_value.function](map, node_value, grade, attributes, hspki);
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

                if (window.habitude.base.consoleLogging) {
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

                console.error(err);

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
                        payloadRef: window.habitude.base.attributes.library[ind].reference,
                        type: window.habitude.base.attributes.library[ind].type,
                        listIndex: listIndex,
                        transformation: transformation,
                        parameter: parameter,
                        editorReference: editorReference,
                        stepIndex: "#"
                    }
                };
                */

                var error = "";
                if (window.habitude.base.consoleLogging) {
                    console.log("   |")
                    console.log("   |")
                    console.log("===> window.habitude.base.functions.render.lookup_single")
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

                var output, fetchedValue, type, subType, action, payload;
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

                    var actionInd = window.habitude.base.findStepIndex(map, obj.params.actionRef, hspki);
                    //console.log(`[lookup_single] actionInd\n${JSON.stringify(actionInd)}`);
                    if (actionInd.value < 0) notFound = true;
                    else action = map._p_actions[actionInd.value];

                    //find the position of the payload in the payload array
                    var payloadInd = !notFound ? window.habitude.base.findPayloadIndex(map, obj.params.payloadRef, actionInd.value, hspki) : { value: -1 };
                    //console.log(`[lookup_single] payloadInd\n${JSON.stringify(payloadInd)}`);
                    if (payloadInd.value < 0) notFound = true;

                    else {
                        //console.log(`action exists: ${!!action}`);
                        //console.log(`About to set payload within action of ID: ${action._p_actionID}`);
                        payload = action._p_payload[payloadInd.value]
                        //console.log(`Payload is now:`);
                        //console.log(payload);
                    };


                    if (notFound && grade === "full") notFound = (function () {

                        //console.log(`\n`);
                        //console.log(`About to go looking for ${obj.params.editorReference}`);

                        // Grab the editor reference
                        let payloadRefTarget = obj.params.payloadRef;
                        let editorReferenceTarget = obj.params.editorReference.toLowerCase().replace('&nbsp;', '').substring(0, 15);

                        if (editorReferenceTarget.includes('pdf')) return true;
                        if (editorReferenceTarget.includes('outcome')) return true;

                        //console.log(`editorReferenceTarget: ${editorReferenceTarget}`);


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

                        if (window.habitude.base.consoleLogging) console.log(`We're going to loop until ${currentActionLoopPoint}`);

                        //console.log(`about to loop until ${currentActionLoopPoint}`);

                        for (var actionIndex = 0; actionIndex < currentActionLoopPoint; actionIndex++) {

                            let thisAction = map._p_actions[actionIndex];
                            if (window.habitude.base.consoleLogging) console.log("Current action in loop is:");
                            if (window.habitude.base.consoleLogging) console.log(thisAction._p_actionID);

                            if (!notFound) break;

                            // Iterate through the payloads
                            thisAction._p_payload.forEach((thisPayload, payloadIndex) => {

                                if (window.habitude.base.consoleLogging) console.log("Opening up the payload:");
                                if (window.habitude.base.consoleLogging) console.log(thisPayload);

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
                        //console.log(`\nTag was found`);
                        //console.log(`actionInd is: ${actionInd.value}`);
                        //console.log(`payloadInd is: ${payloadInd.value}`);
                    };


                    if (notFound) {

                        //console.log("Tag [" + obj.params.editorReference +"]couldn't be found");

                        //console.log(`\nhspki\n${JSON.stringify(hspki)}`);

                        try {
                            if (grade === "partial") window.habitude.base.warnings.addWarning("VALIDATION_invalid_reference", hspki.step, obj.params.editorReference);
                        }
                        catch (err) {
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

                    if (version === "1") type = obj.params.type;
                    else type = map._p_actions[actionInd.value]._p_payload[payloadInd.value]._p_type;

                    subType = map._p_actions[actionInd.value]._p_payload[payloadInd.value]._p_input_output;



                    //check if the types are different.... if they are, defer with the type of the payload

                    //console.log(`Type is: ${type}\nPayload looks like\n${JSON.stringify(map._p_actions[actionInd.value]._p_payload[payloadInd.value])}`);
                    fetchedValue = map._p_actions[actionInd.value]._p_payload[payloadInd.value][`_p_${type}`];

                    //console.log(`fetchedValue is: ${fetchedValue}`);

                }

                //find attributes
                else if (isAttribute) {

                    if (grade === 'partial') {

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

                        if (grade === 'full') {
                            output = "not  found"
                        }

                        return {
                            value: output,
                            error: null
                        }

                    }

                    else if (attributeInd > -1) {

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
                else if (grade === 'full') {

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

                            let transformation = obj.params.transformation;

                            switch (transformation) {
                                case 'null':
                                case null:
                                case '':
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
                                    catch (err) {
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

                            output = (fetchedValue == null) ? '' : String(fetchedValue);

                            if (!output || !subType) break;

                            if (subType === "file") {

                                let transformation = obj.params.transformation;
                                let parameter = obj.params.parameter ? obj.params.parameter : "Click to view file";

                                if (transformation === "url") {


                                }
                                else if (!transformation) {

                                    output = `<a href=\"${output}\">${parameter}</a>`;

                                }
                            }

                            break;

                        case 'valueNumber':
                            output = isNaN(Number(fetchedValue)) ? null : Number(fetchedValue);
                            break;

                        case 'valueBoolean':
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
            catch (err) {

                console.error(err);
            }

        },

        lookup_custom: function (map, obj, grade, attributes, hspki) {

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

            if (window.habitude.base.consoleLogging) {
                console.log("   |")
                console.log("   |")
                console.log("===> window.habitude.base.functions.render.lookup_custom")
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

            else if (grade === 'full') {

                output = obj.params.customText;
                return {
                    value: output,
                    error: null
                }

            }

        },

        lookup_contact: function (map, obj, grade, attributes, hspki) {

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

            if (window.habitude.base.consoleLogging) {
                console.log("   |")
                console.log("   |")
                console.log("===> window.habitude.base.functions.render.lookup_custom")
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

            else if (grade === 'full') {

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

                    let res = window.habitude.base.functions.render.evaluateArray(node_value, map, grade, attributes);
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
                    && node_value.function in window.habitude.base.functions.render) {

                    try {
                        var res = window.habitude.base.functions.render[node_value.function](map, node_value, grade, attributes);
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

            if (window.habitude.base.consoleLogging) {
                console.log("   |")
                console.log("   |")
                console.log("===> window.habitude.base.functions.render.evaluateArray")
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

                if (window.habitude.base.consoleLogging) {
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
                            if (body[x].function in window.habitude.base.functions.render) {
                                if (window.habitude.base.consoleLogging) {
                                    console.log("Calling window.habitude.base.functions.render.", body[x].function);
                                    console.log("with payload of:");
                                    console.log(body[x]);
                                    console.log("   |")
                                    console.log("   |")
                                    console.log("   |")
                                }
                                let res = window.habitude.base.functions.render[body[x].function](map, body[x], grade, attributes, hspki);
                                if (!res.error) {
                                    if (window.habitude.base.consoleLogging) {
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
            if (window.habitude.base.consoleLogging) {
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

window.habitude.base.attributesMethod = function (properties) {

    try {

        var attributes_library_reference = properties.attributes_library_reference.get(0, properties.attributes_library_reference.length());
        var attributes_library_name = properties.attributes_library_name.get(0, properties.attributes_library_name.length());
        var attributes_library_type = properties.attributes_library_type.get(0, properties.attributes_library_type.length());
        var attributes_library_subtype = properties.attributes_library_subtype.get(0, properties.attributes_library_subtype.length());


    }
    catch (err) {
        console.error(err);
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

    catch (err) {
        console.error(err);
    }

    return library;
}

window.habitude.base.warnings = {
    library: [],
    list: [],
    previous: [],
    buildLibrary: function (properties) {

        if (window.habitude.base.warnings.library.length > 0) return;

        try {

            var warningCodes = properties.warning_library_codes.get(0, properties.warning_library_codes.length());
            var warningIds = properties.warning_library_ids.get(0, properties.warning_library_ids.length());


            warningCodes.forEach(function (warning, index) {
                window.habitude.base.warnings.library.push({
                    code: warningCodes[index],
                    id: warningIds[index]
                })
            });

            //console.log("Finished compiling library");
            //console.log(window.habitude.base.warnings.library);
        }

        catch (err) {
            window.habitude.base.warnings.library = [];
            //console.log(err);
            //maybe we add something here.
            //try / catch just in case .get() doesn't play nicely
        }
    },
    addWarning: function (warningCode, stepId, tag) {

        try {

            if (window.habitude.base.consoleLogging) {
                console.log("Adding a warning");
                console.log("Code: ", warningCode);
                console.log("Step: ", stepId);
                console.log();
                console.log("Library");
                console.log(window.habitude.base.warnings.library);
            }

            let warning = window.habitude.base.warnings.library.find(function (warning) {
                return warning.code === warningCode;
            })

            if (!warning) return;

            window.habitude.base.warnings.list.push({
                _p_stepId: stepId,
                _p_warning: warning.code,
                _p_tag: tag
            });

            /*
            //check if there is already an object created for this Step
            let stepInWarningsArr = window.habitude.base.warnings.list.find(function (warningEntry) {
                return warningEntry.stepId === stepId;
            })
    
            if (itemInWarningsArr) {
    
                var warningNotDuplicate = itemInWarningsArr.warnings.indexOf(warning) < 0;
                if (warningNotDuplicate) itemInWarningsArr.warnings.push(warning);
            }
            else window.habitude.base.warnings.list.push({
                stepId: stepId,
                warning: warning,
                tag: tag
            });
            */

        }

        catch (err) {
            window.habitude.base.sendLogglyError("error", null, `Hit an unhandled error adding a warning\n[ARGUMENTS]\n(warningCode, stepId)\n${JSON.stringify(arguments)}\n\n[ERROR MESSAGE]\n${err.message}\n\n[ERROR STACK]\n${err.stack}`, ['library', 'window.habitude.base.warnings.addWarning', 'habitude-main']);

            if (window.habitude.base.consoleLogging) {
                console.log(`[addWarning] Hit an issue adding a warning to the warnings list`)
            }
        }
    }
}


window.habitude.base.convertPartialMapToFull = function (instance, properties) {

    console.log("starting");

    const checkForObjects = function (value) {
        let bookends = String(value).substring(0, 1) + String(value).substring(String(value).length - 1, String(value).length);
        let isStringifiedArray = bookends === "[]";
        let isStringifiedObject = bookends === "{}";

        if (!isStringifiedArray && !isStringifiedObject) return false;

        let canParse = false;

        try {
            JSON.parse(value);
            canParse = true;
        }
        catch (err) {

        }
        return canParse;
    }

    const goVectoriseValue = function(value) {
        if (checkForObjects(value)) {
            let obj = JSON.parse(value);
            if (obj.params.data) {
                for (var objKey in obj.params.data) {

                    console.log(`handling obj.params.data.${objKey}`);;

                    let objValue = obj.params.data[objKey];
                    console.log(`adding:\n${JSON.stringify(objKey)}`);;

                    if (Array.isArray(objValue)) {
                        objValue.forEach((arrayItem, itemIndex) => {
                            objValue[itemIndex] = window.habitude.base.functions.vectoriseText(arrayItem, null);
                        })
                    }
                    else {
                        objValue = window.habitude.base.functions.vectoriseText(objValue, null);
                    }

                    obj.params.data[objKey] = objValue;
                }
            }

            console.log("OBJ IS");
            console.log(obj);
            value = JSON.stringify(obj);
        }

        else {

            let vectoredValue = window.habitude.base.functions.vectoriseText(value, null);
            if (typeof vectoredValue !== "string") {
                if (!vectoredValue) value = null;
                if (Array.isArray(vectoredValue)) {
                    vectoredValue.forEach((arrayItem, itemIndex) => {
                        vectoredValue[itemIndex] = window.habitude.base.functions.vectoriseText(arrayItem, null);
                        if (typeof vectoredValue[itemIndex] !== "string" && !!vectoredValue[itemIndex]) vectoredValue[itemIndex] = JSON.stringify(vectoredValue[itemIndex]);
                    });
                    value = vectoredValue;
                }
                else value = JSON.stringify(vectoredValue);
            }
            else value = vectoredValue;
        }

        return value;
    }

    try {

        //load in a map
        if (!window.habitude.main.maps.partial) return;
        var map_raw = JSON.parse(JSON.stringify(window.habitude.main.maps.partial));

        //load attributes & warnings
        //window.habitude.base.attributes.library = window.habitude.base.attributesMethod(properties);
        //window.habitude.base.warnings.buildLibrary(properties);

        //iterate through the map
        for (var stepCount = 0; stepCount < map_raw._p_actions.length; stepCount++) {

            console.log(`\nStep ${stepCount}`);

            var currentStepInLoop = map_raw._p_actions[stepCount];

            currentStepInLoop._p_payload.forEach(function (payloadInStep, payloadIndex, arr) {

                console.log(`\n--> payload #${payloadIndex}`);
                console.log(Object.keys(payloadInStep));

                for (var key in payloadInStep) {
                    console.log(`\n----> key: ${key}`);

                    let value = payloadInStep[key];

                    console.log(`\n----> value: ${value}`);

                    //is it an array
                    if (Array.isArray(value)) {
                        console.log(`value is an array`);
                        value.forEach((arrayItem, itemIndex) => {
                            value[itemIndex] = goVectoriseValue(arrayItem);
                        })
                    }

                    else {
                        value = goVectoriseValue(value);

                        payloadInStep[key] = value;
                    }
                }
            });

        }


        //now that the map is rendered, we'll handle the workflow payloads and resolve any values in them
        if (map_raw._p_workflowPayloads && Array.isArray(map_raw._p_workflowPayloads) && map_raw._p_workflowPayloads.length > 0) {

            //console.log("handling WorkflowPayloads");

            const resolveWorkflowPayloads = (map) => {



                if (!map._p_workflowPayloads || !Array.isArray(map._p_workflowPayloads)) return;

                let payloadArr = map._p_workflowPayloads;

                payloadArr.forEach((payloadInFocus, index) => {

                    for (var key in payloadInFocus) {
                        console.log(`\n----> key: ${key}`);

                        let value = payloadInFocus[key];

                        console.log(`\n----> value: ${value}`);

                        //is it an array
                        if (Array.isArray(value)) {
                            console.log(`value is an array`);
                            value.forEach((arrayItem, itemIndex) => {
                                value[itemIndex] = window.habitude.base.functions.vectoriseText(arrayItem, null);
                            })
                        }

                        else {
                            console.log(`value is not an array`);
                            if (checkForObjects(value)) {
                                let obj = JSON.parse(value);
                                if (obj.params.data) {
                                    for (var objKey in obj.params.data) {

                                        console.log(`handling obj.params.data.${objKey}`);;

                                        let objValue = obj.params.data[objKey];
                                        console.log(`adding:\n${JSON.stringify(objKey)}`);;
                                        obj.params.data[objKey] = window.habitude.base.functions.vectoriseText(objValue, null);
                                    }
                                }

                                console.log("OBJ IS");
                                console.log(obj);
                                value = JSON.stringify(obj);
                            }

                            else {
                                let vectoredValue = window.habitude.base.functions.vectoriseText(value, null);
                                if (typeof vectoredValue !== "string") {
                                    if (!vectoredValue) value = null;
                                    else value = JSON.stringify(vectoredValue);
                                }
                                else value = vectoredValue;
                            }

                            payloadInFocus[key] = value;
                        }
                    }
                });

            };

            resolveWorkflowPayloads(map_raw);

        }

        window.habitude.main.maps.raw = map_raw;

    }

    catch (err) {
        console.error(err);
    }

}

export default window;
//END
