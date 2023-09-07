function(instance, properties, context) {


    try {
        //Load any data 


        let map = window.$hab.issues.unpack.handler(properties.map);

        var updatedIssues = window.$hab.issues.issuesObject._p_warnings
        .filter(warning => window.$hab.issues.ignoreWarningTypes.includes(warning._p_warning.split('_')[0]));

        var foundIssues = [];

        map._p_actions.forEach((step) => {

            if (!step._p_behaviour) return;

            //console.log(`About to go and check for ${step._p_behaviour}`);

            //check main step's behaviour
            let warningsToCheckFor = window.$hab.issues.warnings.filter(warning => warning.behaviour_option___actions === step._p_behaviour);

            var sender = {
                step: step,
                payload: null,
                type: null,
                warnings: warningsToCheckFor
            }

            if (!window.$hab.issues.checkers[step._p_behaviour] || !window.$hab.issues.checkers[step._p_behaviour].handler) {

                console.log(`Inside catch`);
                throw new Error(`No checker function found for behaviour: ${step._p_behaviour}`);

            }

            let issuesInStep = window.$hab.issues.checkers[step._p_behaviour].handler(sender);
            //let issuesInStep = window.$hab.issues.checkers.form.handler(sender);

            if (!!issuesInStep && Array.isArray(issuesInStep) && issuesInStep.length > 0) {
                foundIssues.push(...issuesInStep); 
            }

            //check each update
            

        })

        updatedIssues.push(...foundIssues);

        window.$hab.issues.issuesObject._p_warnings = updatedIssues;
        
        //console.log("\nwarnings");
        //console.log(window.$hab.issues.issuesObject._p_warnings)

        window.$hab.issues.publishWarnings.handler();

    }

    catch (err) {

        console.error(err);

    }

}