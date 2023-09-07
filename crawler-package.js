
    if (!window.$hab) window.$hab = {};
    if (!window.$hab.issues) window.$hab.issues = {
        checkers: {},
        warnings: [],
        issuesObject: {
            "_p_workflowId": null,
            "_p_warnings": []
        },
        ignoreWarningTypes: ["VALIDATION"]
    };

    if (!window.$hab.base) window.$hab.base = {
        warnings: {
            list: []
        }
    }

    if (!window.$hab.issues.unpack) {

        window.$hab.issues.unpack = {

            handler: function(object){

                //console.log(`inside instance.data.unpack.handler`);
                //console.log(object);
                //console.log(`object.get instanceof Function: ${!(object.get instanceof Function)}`);
                //console.log(object.get instanceof Function);

                if (!object) return null;
                if (!(object.get instanceof Function)) return null;

                if (object.listProperties instanceof Function) this.object(object)
                else if (object.length instanceof Function) this.array(object);

                //console.log("\nAbout to return object from instance.data.unpack.handler");
                //console.log(object);

                return object;


            },

            object: function(object){

                //console.log("\nLanded in object method of instance.data.unpack");

                let objProperties = object.listProperties();

                objProperties.forEach((property) => {

                    object[property] = object.get(property);

                    //console.log(`\n--> key: ${property}\n--> value: ${object[property]}\n--> of type: ${typeof object[property]}\n`);

                    if (!object[property]) return;
                    if (typeof object[property] !== "object") return;

                    if (object[property].listProperties instanceof Function) {
                        this.object(object[property]);
                        //console.log(`New value is:`);
                        //console.log(object[property]);
                    }

                    else if (object[property].length instanceof Function) {
                        object[property] = this.array(object[property]);
                        //console.log(`New value is:`);
                        //console.log(object[property]);
                    }

                });

            },

            array: function(object){

                //console.log("inside array method of instance.data.unpack. Object is:");
                //console.log(object);
                //console.log(`length is: ${object.length()}`);

                let objArray = object.get(0, object.length());

                //console.log(`objArray:`);
                //console.log(objArray);

                objArray.forEach((item) => {

                    if (item.listProperties instanceof Function) this.object(item)
                    else if (item.length instanceof Function) this.array(item);

                });

                return objArray;

            }
        }
    }

    if (!window.$hab.issues.publishWarnings) {

        window.$hab.issues.publishWarnings = {

            handler: function() {

                var updatedIssues = window.$hab.issues.issuesObject._p_warnings
                .filter(warning => !(window.$hab.issues.ignoreWarningTypes.includes(warning._p_warning.split('_')[0])));

                console.log(`\nupdatedIssues`);
                console.log(updatedIssues);

                updatedIssues.push(...window.$hab.base.warnings.list);

                window.$hab.issues.issuesObject._p_warnings = updatedIssues;

                this.register.forEach((fn) => {
                    fn(); 
                });

            },

            register: []

        };

    };

    //register 
    window.$hab.issues.publishWarnings.register.push(function() {
        instance.publishState('warning_object', window.$hab.issues.issuesObject);
    })


    if (Object.keys(window.$hab.issues.checkers).length < 1 ) {

        window.$hab.issues.checkers.spreadsheet = {
            handler: function (sender) {

                if (!sender.step && !sender.payload) return;
                if (!sender.warnings.length) return;

                let outputWarnings = [];

                if (!sender.payload && !!sender.step) {

                    sender.payload = sender.step._p_payload.find(payload => payload._p_internalRef === 'integration');
                    if (!sender.payload) return outputWarnings;

                    //console.log(sender.payload);

                }

                try {
                    var packet = JSON.parse(sender.payload._p_externalRef);
                }
                catch (err) {
                    console.error(err);
                    return;
                }

                sender.packet = packet;



                sender.warnings.forEach((warning) => {
                    if (!this[warning.code_text]) return;

                    let test = this[warning.code_text](sender, warning);
                    if (!test.result) return;

                    outputWarnings.push({
                        "_p_stepId": sender.step._p_actionID,
                        "_p_warning": warning.code_text,
                        "_p_title": test.title,
                        "_p_message": test.message
                    })
                });

                return outputWarnings;
            },
            SPREADSHEET_no_file: function (sender, warning) {

                return {
                    result: !sender.packet.params.data.file_id,
                    title: warning.description_text,
                    message: warning.editor_message_text
                };
            },
            SPREADSHEET_sync_needed: function (sender, warning) {
                return {
                    result: false,
                    title: warning.description_text,
                    message: warning.editor_message_text
                };
            }
        };
        window.$hab.issues.checkers.decision = {
            handler: function (sender) {

                if (!sender.step && !sender.payload) return;
                if (!sender.warnings.length) return;

                //console.log(`Inside decision.handler`);
                //console.log(sender);

                let outputWarnings = [];

                sender.warnings.forEach((warning) => {
                    if (!this[warning.code_text]) return;

                    let test = this[warning.code_text](sender, warning);
                    if (!test.result) return;

                    outputWarnings.push({
                        "_p_stepId": sender.step._p_actionID,
                        "_p_warning": warning.code_text,
                        "_p_title": test.title,
                        "_p_message": test.message
                    })
                });

                return outputWarnings;
            },
            APPROVAL_no_decision: function (sender, warning) {
                return {
                    result: !sender.step._p_name,
                    title: warning.description_text,
                    message: warning.editor_message_text
                };
            },
            APPROVAL_approver_blank: function (sender, warning) {

                let approver = sender.step._p_payload.find(payload => payload._p_internalRef === "approver");

                return {
                    result: !approver._p_valueText,
                    title: warning.description_text,
                    message: warning.editor_message_text
                };
            }
        };
        window.$hab.issues.checkers.email = {
            handler: function (sender) {

                if (!sender.step) return;
                if (!sender.warnings.length) return;

                let outputWarnings = [];

                if (!sender.payload && !!sender.step) {


                    sender.payload = sender.step._p_payload.find(payload => payload._p_internalRef === 'integration');
                    if (!sender.payload) return outputWarnings;

                    //console.log(sender.payload);

                }


                try {
                    var packet = JSON.parse(sender.payload._p_externalRef);
                }
                catch (err) {
                    console.error(err);
                    return;
                }

                sender.packet = packet;

                sender.warnings.forEach((warning) => {
                    if (!this[warning.code_text]) return;

                    let test = this[warning.code_text](sender, warning);
                    if (!test.result) return;

                    outputWarnings.push({
                        "_p_stepId": sender.step._p_actionID,
                        "_p_warning": warning.code_text,
                        "_p_title": test.title,
                        "_p_message": test.message
                    })
                });

                return outputWarnings;
            },
            EMAIL_no_message: function (sender, warning) {

                return {
                    result: !sender.packet.params.data.body,
                    title: warning.description_text,
                    message: warning.editor_message_text
                };
            },
            EMAIL_no_subject: function (sender, warning) {

                return {
                    result: !sender.packet.params.data.subject,
                    title: warning.description_text,
                    message: warning.editor_message_text
                };
            },
            EMAIL_no_recipient: function (sender, warning) {

                let result = true;

                try {
                    result = !sender.packet.params.data.recipients
                    && Array.isArray(sender.packet.params.data.recipients)
                    && sender.packet.params.data.recipients.length > 0;

                }

                catch (err) {
                    if (sender.logging) console.log(err.message);
                }

                finally {
                    return {
                        result: result,
                        title: warning.description_text,
                        message: warning.editor_message_text
                    };
                }
            }
        }
        window.$hab.issues.checkers.form = {
            handler: function (sender) {
                console.log(sender);

                let outputWarnings = [];

                console.log(`Inside window.$hab.issues.checkers.form`);

                if (!sender.step) return outputWarnings;

                if (!sender.payload && !!sender.step) {

                    console.log("Adding payload to sender");

                    sender.payload = sender.step._p_payload.find(payload => payload._p_internalRef === 'form_json');
                    if (!sender.payload) return outputWarnings;

                    console.log(sender.payload);

                }

                if (!sender.warnings.length) {
                    return outputWarnings;
                }

                var packet;

                try {
                    packet = JSON.parse(sender.payload._p_externalRef);
                }
                catch (err) {
                    console.error(err);
                }

                sender.packet = packet;

                sender.warnings.forEach((warning) => {
                    if (!this[warning.code_text]) return;

                    let test = this[warning.code_text](sender, warning);
                    if (!test.result) return;

                    outputWarnings.push({
                        "_p_stepId": sender.step._p_actionID,
                        "_p_warning": warning.code_text,
                        "_p_title": test.title,
                        "_p_message": test.message
                    })
                });

                return outputWarnings;
            },
            FORM_no_questions: function (sender, warning) {

                let result = true;

                try {

                    if (!sender.packet) {
                        throw new Error('No form JSON packet available')
                    }

                    console.log(sender.packet);

                    for (let pageIndex = 0; pageIndex < sender.packet.params.data.form_json.pages.length; pageIndex++) {

                        let pageHasQuestions = sender.packet.params.data.form_json.pages[pageIndex].elements
                        && sender.packet.params.data.form_json.pages[pageIndex].elements.length > 0;

                        console.log(`pageHasQuestions: ${pageHasQuestions}`);

                        if (pageHasQuestions) {
                            result = false;
                            break;
                        }
                    }

                }

                catch (err) {
                    if (sender.logging) console.log(err.message)   
                }

                finally {

                    return {
                        result: result,
                        title: warning.description_text,
                        message: warning.editor_message_text
                    };
                }
            },
            FORM_recipient_blank: function (sender, warning) {

                let result = true;

                try {
                    if (sender.step._p_actionIndex === 1) {
                        result = false;
                        throw new Error('[issues.checker] Skipping FORM_recipient_blank as this is a trigger form');
                    }

                    let recipient = sender.step._p_payload.find(payload => payload._p_internalRef === "recipient");
                    if (recipient) result = recipient._p_valueText ? false : true;                
                }

                catch(err){
                    if (sender.logging) console.log(err.message);
                }

                finally {

                    return {
                        result: result,
                        title: warning.description_text,
                        message: warning.editor_message_text
                    };                
                }



            },
            FORM_no_name: function (sender, warning) {

                let result = true;

                try {

                    if (sender.step._p_name) result = false;

                }

                catch (err) {

                    if (sender.logging) console.log(err.message);
                }

                finally {

                    return {
                        result: !sender.step._p_name,
                        title: warning.description_text,
                        message: warning.editor_message_text
                    };
                }
            }
        };
        window.$hab.issues.checkers.checklist = {
            handler: function (sender) {

                if (!sender.step && !sender.payload) return;
                if (!sender.warnings.length) return;

                let outputWarnings = [];

                sender.warnings.forEach((warning) => {
                    if (!this[warning.code_text]) return;

                    let test = this[warning.code_text](sender, warning);
                    if (!test.result) return;

                    outputWarnings.push({
                        "_p_stepId": sender.step._p_actionID,
                        "_p_warning": warning.code_text,
                        "_p_title": test.title,
                        "_p_message": test.message
                    })
                });

                return outputWarnings;
            },
            CHECKLIST_no_items: function (sender, warning) {

                let result = true;

                try {
                    result = !(sender.step._p_payload.filter(payload => payload._p_internalRef === "checklist__item").length > 0);     
                }

                catch (err) {
                    if (sender.logging) console.log(err.message);   
                }

                finally {

                    return {
                        result: result,
                        title: warning.description_text,
                        message: warning.editor_message_text
                    };
                }
            },
            CHECKLIST_recipient_blank: function (sender, warning) {

                let result = true;

                try {

                    let recipient = sender.step._p_payload.find(payload => payload._p_internalRef === "recipient");

                    if (recipient && recipient._p_valueText) result = false;

                }

                catch (err) {

                    if (sender.logging) console.log(err.message);

                }

                finally {
                    return {
                        result: result,
                        title: warning.description_text,
                        message: warning.editor_message_text
                    };
                }
            }
        };

    }

