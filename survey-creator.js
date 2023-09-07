function(instance, properties, context) {

    instance.data.logging_on = properties.logging;
    if (!instance.data.version) instance.data.version = isNaN(Number(properties.editor_version)) ? 1 : Number(properties.editor_version);

    if (!properties.existing_form && instance.data.init) return;


    instance.data.log(`form creator/update`, properties, `properties`);

    var isNewForm = properties.existing_form && (properties.existing_form !== instance.data.jsonAtLoad);

    if (!instance.data.init) {

        instance.data.jsonAtLoad = properties.existing_form;

        instance.data.log("There are this many questions:");
        instance.data.log(instance.data.countQuestions(instance.data.jsonAtLoad, null) + "\n\n");

        instance.data.log("instance.data.jsonAtLoad");
        instance.data.log(instance.data.jsonAtLoad);

        instance.data.log(`form creator/update`, `set to ${instance.data.init}, initializing element`, `instance.data.init`);

        instance.data.tag_length = properties.tag_length ? properties.tag_length : 15;
        instance.data.log(`form creator/update`, instance.data.version, `version`);

        // Assign data fields to data variables within instance.data

        instance.data.json = properties.existing_form;
        instance.data.tag_length = properties.tag_length;
        instance.data.original_full_screen = properties.full_screen;
        instance.data.full_screen = properties.full_screen;
        instance.data.delimiter = properties.delimiter;
        instance.data.trigger_form = properties.trigger_form;

        // change state of full screem to instance.data.full_screen - this stores a boolean
        instance.publishState("full_screen", instance.data.full_screen);


        var prop = Survey
        .Serializer
        .findProperty("text", "inputType");

        // Remove options from data input type
        let blacklist = ['color', 'datetime', 'datetime-local', 'month', 'range', 'time', 'week', 'tel']

        for (propIndex = 0; propIndex < prop.choices.length; propIndex++) {
            if (blacklist.includes(prop.choices[propIndex])) {
                prop.choices.splice(propIndex, 1)
                propIndex--
            }
        }


        let whiteList = ["completedHtml", "title", "description", "visibleIf", "logoWidth", "logoHeight", "logoFit", "completeText", "showProgressBar", "progressBarType", "inputType", "placeHolder", "dataList", "isRequired", "choices", "choicesFromQuestion", "choicesFromQuestionMode", "choicesOrder", "hasOther", "otherText", "otherPlaceHolder", "hasNone", "noneText", "maxSelectedChoices", "commentPlaceHolder", "rateMin", "rateMax", "rateStep", "minRateDescription", "maxRateDescription", "label", "labelTrue", "labelFalse", "acceptedTypes", "showPreview", "waitForUpload", "maxSize", "width", "height", "penColor", "defaultValue", "step"];

        // Create object entitled options that stores values for specific parameters. Link to URL: https://surveyjs.io/Documentation/Survey-Creator?id=ICreatorOptions
        let options = {
            // showTestSurveyTab: false,
            // showJSONEditorTab: false
            questionTypes: JSON.parse(properties.question_types),
            designerHeight: "", // fit surveyJS to the parent container size
            showSimulatorInTestSurveyTab: true, // Shows test option
            useTabsInElementEditor: true, // Allow tabs
            showJSONEditorTab: false, // Prevent users from editing the JSON file
            showPagesToolbox: true, // Show the pages toolbox for users to edit their questions. This appears on right hand side.
            isAutoSave: true, // Auto saves survey as being built.
            showTestSurveyTab: true, // Shows test optionality
            showObjectTitles: true, // 
            showLogicTab: true,
            showSurveyTitle: 'never',
            allowControlSurveyTitleVisibility: false
            //showEmbeddedSurveyTab: true,
        };

        Survey.Serializer.addProperty("text", {
            name: "defaultToLoggedInUserEmail",
            category: "general",
            visibleIndex: 7,
            type: "boolean",
            typeValue: "switch",
            dependsOn: ["inputType"],
            visibleIf: function (obj) {
                return (
                    obj.inputType === "email"
                );
            }
        });

        //date picker
        window['surveyjs-widgets'].jqueryuidatepicker(Survey);


        //IMMEDIATE DATE QUESTION
        let nearby = Survey.ComponentCollection.Instance.customQuestionValues.find((customQuestion) => customQuestion.name === 'nearbydate');

        if (!nearby) {
            Survey.ComponentCollection.Instance.add({
                name: "nearbydate",
                title: "Nearby date",
                iconName: "icon-select-page",
                elementsJSON: [{
                    "type": "radiogroup",
                    "name": "chooseDateOption",
                    "title": "Pick date",
                    "defaultValue": "Today",
                    "choices": [
                        "Yesterday",
                        "Today",
                        "Tomorrow",
                        "Other"
                    ]
                }, {
                    type: "text",
                    name: "datePicker",
                    inputType: "date",
                    title: "Date selected",
                    enableIf: "{composite.chooseDateOption} = 'Other'"
                }
                              ],
                onValueChanged(question, name) {
                    const chooseDateOption = question.contentPanel.getQuestionByName("chooseDateOption");
                    const datePicker = question.contentPanel.getQuestionByName("datePicker");

                    if (name === "chooseDateOption") {

                        let today = new Date();

                        switch (chooseDateOption.value){

                            case "Yesterday":

                                let yesterday = new Date(today.setDate(today.getDate() - 1));
                                datePicker.value = yesterday.toISOString().split("").slice(0, 10).join("");
                                break;

                            case "Today":

                                datePicker.value = today.toISOString().split("").slice(0, 10).join("");
                                break;

                            case "Tomorrow":

                                let tomorrow = new Date(today.setDate(today.getDate() + 1));
                                datePicker.value = tomorrow.toISOString().split("").slice(0, 10).join("");
                                break;
                                                      }
                    }

                }
            });
        }



        //AUTOFILL

        window.autofillChoices = [];


        if (typeof Survey.Serializer.findProperty("text", "autoFill_step") !== "object") {

            Survey.Serializer.addProperty("text", {
                name: "autoFill_step",
                displayName: "Choose step",
                category: "Autofill",
                type: "dropdown",
                dependsOn: ["inputType"],
                choices: (object) => {

                    try {

                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return [];

                        instance.data.log(`\n- - - - - - - - - - - - - - - \autoFill_step choices()\n`);
                        instance.data.log(object);

                        let map = window.getEnv('map_partial');
                        if (map._p_actions.length === 0) return [];

                        //console.log(`\npropertyValue(step) is: ${object.survey.getPropertyValue("step")}`);
                        //console.log(`Does that property even exist: ${typeof Survey.Serializer.findProperty("survey", "step")}`);

                        let thisStep = map._p_actions.find(step => {
                            return step._p_actionID === object.survey.getPropertyValue("step");
                        });

                        //console.log(`[autoFill_step.choices.function] thisStep is:`);
                        //console.log(thisStep);

                        if (!thisStep) return false;

                        var stepOptions = window.getEnv('map_partial')._p_actions
                        .filter(step => step._p_actionIndex < thisStep._p_actionIndex)
                        .map((action) => {

                            var label = `Step ${action._p_actionIndex}`;
                            if (action._p_behaviour) label += `: ${action._p_behaviour.charAt(0).toUpperCase() + action._p_behaviour.slice(1)}`
                            if (action._p_name) label += ` / ${action._p_name}`

                            return {
                                text: label,
                                value: action._p_actionID
                            }

                        });
                        //console.log("\nReturning step choices:");
                        //console.log(stepOptions);

                        return stepOptions;
                        //if (Array.isArray(window.autofillChoices) && window.autofillChoices.length > 0) return window.autofillChoices;


                    }

                    catch (err) {

                        console.error(err);

                    }

                },
                visibleIf: function (object) {

                    try {

                        instance.data.log(`instance.data.trigger_form: ${instance.data.trigger_form}\n!window.getEnv: ${!window.getEnv}\nwindow.getEnv('map_partial') === null: ${window.getEnv('map_partial') === null}`);
                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return false;

                        instance.data.log(`\n- - - - - - - - - - - - - - - \autoFill_step visibileIf()\n`);
                        instance.data.log(object);

                        instance.data.log(`visibleIf()\nproperty("step") is ${object.survey.getPropertyValue("step")}`);
                        instance.data.log(`Does that property even exist: ${typeof Survey.Serializer.findProperty("survey", "step")}`);

                        instance.data.log(`visibleIf()\nvariable("step") is ${object.survey.getVariable("step")}`);

                        let map = window.getEnv('map_partial');
                        if (map._p_actions.length === 0) return;

                        instance.data.log(`\npropertyValue(step) is: ${object.survey.getPropertyValue("step")}`);
                        var stepId = String(object.survey.getPropertyValue("step")).trim();
                        instance.data.log(`stepId length is: ${stepId.length}`);


                        let thisStep = map._p_actions.find(step => {
                            instance.data.log(step._p_actionID);
                            instance.data.log(`which is of length ${step._p_actionID.length}\n`);
                            instance.data.log(`Is it a match: ${step._p_actionID === stepId}`);
                            return step._p_actionID === stepId;
                        });

                        instance.data.log(`[autoFill_step.visibleIf.function] thisStep is (${object.survey.getPropertyValue("step")}):`);
                        instance.data.log(thisStep);

                        if (!thisStep) return false;

                        instance.data.log("autoFill_step visibility test: " + (window.getEnv && window.getEnv('map_partial') !== null));

                        instance.data.log("steps visible:");
                        instance.data.log(map._p_actions.filter(step => step._p_actionIndex < thisStep._p_actionIndex).length > 0);

                        return map._p_actions.filter(step => step._p_actionIndex < thisStep._p_actionIndex).length > 0;

                    }

                    catch (err) {

                        console.error(err);

                    }

                }
            });


            Survey.Serializer.addProperty("text", {
                name: "autoFill_payload",
                displayName: "Choose tag",
                category: "Autofill",
                type: "dropdown",
                dependsOn: ["autoFill_step"],
                choices: (object) => {

                    try {

                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return [];


                        instance.data.log(`\n- - - - - - - - - - - - - - - \nautoFill_payload choices()\n`);

                        var chosenStep = window.getEnv('map_partial')._p_actions.find((action) => {
                            return action._p_actionID === object.autoFill_step;
                        });

                        instance.data.log(`[autoFill_payload.choices.function] chosenStep is:`);
                        instance.data.log(chosenStep);

                        if (!chosenStep) return;

                        var filter = instance.data.inputFieldToTypeMapping.find((item) => {
                            instance.data.log(item);
                            return item.inputField === object.inputType;
                        });

                        instance.data.log("\nfilter");
                        instance.data.log(filter);

                        var payloadOptions = chosenStep._p_payload.filter(payload => {

                            if (payload._p_type !== filter.type ||
                                !payload._p_builderRef ||
                                (filter.subTypes.length > 0 && filter.subTypes.indexOf(payload._p_input_output) === -1)) return false;

                            return true;

                        }).map(payload => {
                            var label;
                            var builderRefDelim = payload._p_builderRef.split('/');
                            if (builderRefDelim.length > 1) label = builderRefDelim[1];
                            else label = builderRefDelim[0];

                            var tag;
                            if (properties.editor_version === "1") tag = `{{${payload._p_ref}${instance.data.delimiter}${label}${instance.data.delimiter}${chosenStep._p_actionIndex}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}t}}`;
                            else if (properties.editor_version === "2") tag = `{{${chosenStep._p_actionID}_${payload._p_ref}${instance.data.delimiter}${label}${instance.data.delimiter}${chosenStep._p_actionIndex}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}t}}`

                            return {
                                text: label,
                                value: tag
                            }
                        });

                        instance.data.log("payloadOptions array:");
                        instance.data.log(payloadOptions);

                        return payloadOptions;

                    }

                    catch (err) {

                        console.error(err);

                    }
                },
                visibleIf: function (object) {

                    try {

                        if (instance.data.trigger_form || typeof object.autoFill_step !== "string" || !window.getEnv || window.getEnv('map_partial') === null) return false;

                        instance.data.log(`\n- - - - - - - - - - - - - - - \nautoFill_payload visibleIf()\n`);
                        var chosenStep = window.getEnv('map_partial')._p_actions.find((action) => {
                            return action._p_actionID === object.autoFill_step;
                        });

                        if (!chosenStep) return false;

                        var filter = instance.data.inputFieldToTypeMapping.find((item) => {
                            return item.inputField === object.inputType;
                        });

                        instance.data.log("Filter:");
                        instance.data.log(filter);

                        var payloadOptions = chosenStep._p_payload.filter(payload => {

                            if (payload._p_type !== filter.type ||
                                !payload._p_builderRef ||
                                (filter.subTypes.length > 0 && filter.subTypes.indexOf(payload._p_input_output) === -1)) return false;

                            return true;

                        });

                        if (payloadOptions.length < 1) {
                            return false;

                        }

                        return true;
                    }

                    catch (err) {
                        console.error(err);
                    }

                }
            });

        }

        if (typeof Survey.Serializer.findProperty("dropdown", "autoFill_step") !== "object") {

            Survey.Serializer.addProperty("dropdown", {
                name: "autoFill_step",
                displayName: "Choose step",
                category: "Autofill",
                type: "dropdown",
                dependsOn: ["choices"],
                choices: (object) => {


                    try {

                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return [];

                        instance.data.log(`\n- - - - - - - - - - - - - - - \autoFill_step choices()\n`);
                        instance.data.logg(object);

                        let map = window.getEnv('map_partial');
                        if (map._p_actions.length === 0) return [];

                        let thisStep = map._p_actions.find(step => {
                            return step._p_actionID === object.survey.getPropertyValue("step");
                        });

                        instance.data.log(`[autoFill_step.choices.function] thisStep is:`);
                        instance.data.log(thisStep);

                        if (!thisStep) return false;

                        var stepOptions = window.getEnv('map_partial')._p_actions
                        .filter(step => step._p_actionIndex < thisStep._p_actionIndex)
                        .map((action) => {

                            var label = `Step ${action._p_actionIndex}`;
                            if (action._p_behaviour) label += `: ${action._p_behaviour.charAt(0).toUpperCase() + action._p_behaviour.slice(1)}`
                            if (action._p_name) label += ` / ${action._p_name}`

                            return {
                                text: label,
                                value: action._p_actionID
                            }

                        });
                        instance.data.log("\nReturning step choices:");
                        instance.data.log(stepOptions);

                        return stepOptions;


                    }

                    catch (err) {

                        console.error(err);

                    }

                },
                visibleIf: function (object) {


                    try {

                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return false;

                        let map = window.getEnv('map_partial');
                        if (map._p_actions.length === 0) return;

                        var stepId = String(object.survey.getPropertyValue("step")).trim();


                        let thisStep = map._p_actions.find(step => {
                            return step._p_actionID === stepId;
                        });

                        if (!thisStep) return false;

                        return map._p_actions.filter(step => step._p_actionIndex < thisStep._p_actionIndex).length > 0;

                    }

                    catch (err) {
                        console.error(err);
                    }

                }
            });


            Survey.Serializer.addProperty("dropdown", {
                name: "autoFill_payload",
                displayName: "Choose tag",
                category: "Autofill",
                type: "dropdown",
                dependsOn: ["autoFill_step"],
                choices: (object) => {

                    try {

                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return [];
                        instance.data.log(`\n- - - - - - - - - - - - - - - \nautoFill_payload choices()\n`);

                        var chosenStep = window.getEnv('map_partial')._p_actions.find((action) => {
                            return action._p_actionID === object.autoFill_step;
                        });

                        instance.data.log(`[autoFill_payload.choices.function] chosenStep is:`);
                        instance.data.log(chosenStep);

                        if (!chosenStep) return;

                        var filter = instance.data.inputFieldToTypeMapping.find((item) => {
                            instance.data.log(item);
                            return item.inputField === "text";
                        });

                        instance.data.log("\nfilter");
                        instance.data.log(filter);

                        var payloadOptions = chosenStep._p_payload.filter(payload => {

                            if (payload._p_type !== filter.type ||
                                !payload._p_builderRef ||
                                (filter.subTypes.length > 0 && filter.subTypes.indexOf(payload._p_input_output) === -1)) return false;

                            return true;

                        }).map(payload => {
                            var label;
                            var builderRefDelim = payload._p_builderRef.split('/');
                            if (builderRefDelim.length > 1) label = builderRefDelim[1];
                            else label = builderRefDelim[0];

                            var tag;
                            if (properties.editor_version === "1") tag = `{{${payload._p_ref}${instance.data.delimiter}${label}${instance.data.delimiter}${chosenStep._p_actionIndex}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}t}}`;
                            else if (properties.editor_version === "2") tag = `{{${chosenStep._p_actionID}_${payload._p_ref}${instance.data.delimiter}${label}${instance.data.delimiter}${chosenStep._p_actionIndex}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}${instance.data.delimiter}t}}`

                            return {
                                text: label,
                                value: tag
                            }
                        });

                        instance.data.log("payloadOptions array:");
                        instance.data.log(payloadOptions);

                        return payloadOptions;

                    }

                    catch (err) {

                        console.error(err);

                    }
                },
                visibleIf: function (object) {

                    try {

                        if (instance.data.trigger_form || !window.getEnv || window.getEnv('map_partial') === null) return false;

                        instance.data.log(`\n- - - - - - - - - - - - - - - \nautoFill_payload visibleIf()\n`);

                        if (typeof object.autoFill_step !== "string" || !window.getEnv || window.getEnv('map_partial') === null) return false;

                        var chosenStep = window.getEnv('map_partial')._p_actions.find((action) => {
                            return action._p_actionID === object.autoFill_step;
                        });

                        if (!chosenStep) return false;

                        var filter = instance.data.inputFieldToTypeMapping.find((item) => {
                            return item.inputField === "text";
                        });

                        instance.data.log("Filter:");
                        instance.data.log(filter);

                        var payloadOptions = chosenStep._p_payload.filter(payload => {

                            if (payload._p_type !== filter.type ||
                                !payload._p_builderRef ||
                                (filter.subTypes.length > 0 && filter.subTypes.indexOf(payload._p_input_output) === -1)) return false;

                            return true;

                        });

                        if (payloadOptions.length < 1) {
                            return false;

                        }

                        return true;
                    }

                    catch (err) {
                        console.error(err);
                    }

                }
            });

        }

        if (typeof Survey.Serializer.findProperty("question", "id") !== "object") {
            Survey.Serializer.addProperty("question", { name: "id", category: "general" });
        }

        //Make name and tag properties read-only
        Survey.Serializer.findProperty("question", "name").readOnly = true;
        Survey.Serializer.findProperty("question", "id").readOnly = true;

        if (typeof Survey.Serializer.findProperty("survey", "step") !== "object") {

            Survey.Serializer.addProperty("survey", { name: "step", type: "text", category: "general", visible: true, readOnly: true })

        };

        if (typeof Survey.Serializer.findProperty("survey", "show_preview") !== "object") {

            Survey.Serializer.addProperty("survey", { name: "show_preview", type: "checkbox", category: "general", visible: false, readOnly: true })

        };

        SurveyCreator.SurveyQuestionEditorDefinition.definition["file"].properties.push({ name: "storeDataAsText", visible: false });








        //initialise the creator

        instance.data.creator = new SurveyCreator.SurveyCreator(options);


        instance.data.creator.survey.setPropertyValue("step", properties.current_step_id);

        instance.data.creator.onElementAllowOperations.add(function (s, o) {
            o.allowEdit = true;
        });

        instance.data.creator.onPropertyGridSurveyCreated.add((sender, options) => {
            const propGrid = options.survey;
            const panels = propGrid.getAllPanels();
            for (let i = 1; i < panels.length; i++) {
                //panels[i].visible = false;
            }

            panels[0].expand();
            panels[0].title = '';
        });


        const propertyStopList = [
            "cellType",
            "name",
            "visible",
            "dataList",
            "autoComplete",
            "allowAddRows",
            "allowRemoveRows",
            "allowRowsDragAndDrop",
            "rowCount",
            "minRowCount",
            "maxRowCount",
            "addRowLocation",
            "addRowText",
            "removeRowText",
            "confirmDelete",
            "confirmDeleteText",
            "totalText",
            "hasComment",
            "commentText",
            "commentPlaceHolder",
            { name: "storeDataAsText" },
            "imageHeight",
            "imageWidth",
            "waitForUpload",
            "needConfirmRemoveFile",
            "autocomplete"
        ];

        // Hide properties contained in the black list, show all other properties
        /*
        instance.data.creator.onShowingProperty.add(function (sender, options) {


            //console.log(sender);
            if (!sender.survey.getPropertyValue("step")) {

                sender.survey.setPropertyValue("step", properties.current_step_id);
                //console.log("Step: " + instance.data.creator.survey.getPropertyValue("step"));
            }

            if (sender.survey.getPropertyValue("show_preview") === undefined) sender.survey.setPropertyValue("show_preview", false);

            if (instance.data.show_preview === undefined) {
                instance.data.show_preview = sender.survey.getPropertyValue("show_preview");
                instance.publishState("show_preview", instance.data.show_preview);
            }

            //console.log(options.property.name);
            options.canShow = propertyStopList.indexOf(options.property.name) == -1;

        });
        */

        var file = instance.data.creator.toolbox.getItemByName("file");
        /*
        instance.data.creator
            .toolbarItems
            .splice(3, 0, new Survey.Action({
            id: "templates",
            visible: true,
            title: "Templates",
            action: function () {

                instance.triggerEvent("templates_click", function(err){});

            }
        }));

        /*
        instance.data.creator
            .toolbarItems
            .push(new Survey.Action({
            id: "full-screen",
            visible: true,
            showTitle: properties.full_screen ? true : false,
            title: properties.full_screen ? "Exit full-screen" : "Go full-screen",
            iconName: "full-screen-class",
            action: function () {
                /*
                        if (instance.data.full_screen) {
                            var ind = instance.data.creator.toolbarItems.findIndex(function(item){
                                return item.id === "full-screen"
                            });

                            instance.data.creator.toolbarItems[ind].showTitle = false;
                            instance.data.creator.toolbarItems[ind].title = "Go full-screen";
                            instance.data.creator.toolbarItems[ind].iconName = "full-screen-class";

                        }

                        else {
                            var ind = instance.data.creator.toolbarItems.findIndex(function(item){
                                return item.id === "full-screen"
                            });

                            instance.data.creator.toolbarItems[ind].showTitle = true;
                            instance.data.creator.toolbarItems[ind].title = "Exit full-screen";
                            instance.data.creator.toolbarItems[ind].iconName = null;
                        }


                instance.publishState("full_screen", instance.data.full_screen);
                instance.triggerEvent("full_screen", function(err){});

            }}));


        instance.data.creator
            .toolbarItems
            .splice(10,1);

    */

        instance.data.creator.onQuestionAdded.add(function (sender, options) {

            if (!instance.data.init) return;

            if (options.question.storeDataAsText) {
                options.question.storeDataAsText = false;
            }


            //on newer version of Habitude forms we are setting an id property on each question to a random value
            //this then carries through to become our externalRef value on the payload, and will be used to
            //decide whether a question is already represented by a payload on the map, or whether one needs to be created

            if (instance.data.version > 1) {
                var q = options.question;
                var type = q.getType();

                if (type === "datepicker") {
                    q.setPropertyValue("config",{changeYear: true});
                    q.setPropertyValue('dateFormat', 'dd/mm/yy');
                }

                q.setPropertyValue("id", instance.data.guid(2));
                q.setPropertyValue("name", `New question (${type})`);

                instance.data.log("\nNew question added:");

                //instance.data.setNames(options.page.survey, q.getPropertyValue("id"));
            }


            instance.data.log(`form creator/update`, `calling autosave`, `onQuestionAdded`);
            instance.data.autosave(sender, 1000);

        });

        /*
        instance.data.creator.onElementDeleting.add(function (sender, options) {

            instance.data.log(`form creator/update`, `calling instance.data.exposeLists`, `onElementDeleting`);
            if (instance.data.init) instance.data.autosave(sender, 200);

            instance.data.autosave(sender, 3000);

        });
        */

        instance.data.creator.onModified.add(function (sender, options) {

            if (!instance.data.init) return;

            instance.data.log(`form creator/update`, `calling autosave`, `onModified`);
            //console.log("options object is:");
            //console.log(options);
            //instance.data.autosave(sender, 50);


            if (options.type === "PROPERTY_CHANGED" && options.name === "title" && options.target.activePage) {
                instance.publishState("form_title", options.newValue);
                instance.triggerEvent("form_title_updated", function (err) { });
            }

            instance.data.autosave(sender, 100);
            /*
            if (instance.data.version > 1) instance.data.setNames(sender.survey);
            */

        });


        instance.data.creator.showToolbox = properties.show_toolbox;
        instance.data.creator.showSidebar = false;


        switch (instance.data.version) {

            case 1:

                if (!properties.existing_form) instance.data.creator.survey.completedHtml = "<h1></h1><p><h4></h4></p>";
                else instance.data.creator.text = properties.existing_form;

                instance.data.creator.render(instance.data.divName);

                break;

            case 2:
            default:

                break;
                                     }

        instance.data.creator.haveCommercialLicense = true;
        instance.data.creator.showObjectTitles = true;

        instance.data.init = true;
        instance.publishState("form_initialised", true);
        instance.triggerEvent("form_ready", (err) => { });
        instance.data.log(`form creator/update`, `set to ${instance.data.init}, element is initialized`, `instance.data.init`);

    }

    //console.log("instance.data.jsonAtLoad (base of main)");
    //console.log(instance.data.jsonAtLoad);
    //console.log("\nproperties.existing_form");
    //console.log(properties.existing_form);

    if (!instance.data.jsonAtLoad && properties.existing_form && instance.data.version === 1) {

        //console.log(`After not receiving JSON on load, now adding form JSON into SurveyJS instance`);

        //console.log("instance.data.jsonAtLoad");
        //console.log(instance.data.jsonAtLoad);


        instance.data.log(`form creator/update`, properties, `properties`);

        instance.data.creator.text = properties.existing_form;

    }
}