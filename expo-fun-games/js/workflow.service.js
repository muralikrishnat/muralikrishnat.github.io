var workflowService = {
    registration: {
        getPageErrors: function() {
            return [];   
        },
        handlePayload: function(pageData, dataManager) {
            dataManager.save({
                firstName: pageData.firstName,
                lastName: pageData.lastName,
                phone: pageData.phone
            });
        }
    },
    welcome: {

    },
    scan: {
        getNextStepData: function(pageData, stepData, availableGames) {
            var errors = [], nextStep;
            if (pageData['qrText'].length === 0) {
                errors.push({
                    message: "Please scan for QR code"
                });
            }
            var nextStepIndex = Math.floor(Math.random() * availableGames.length);
            nextStep = availableGames[nextStepIndex].getStepName();
            dataManager.updateLastClue({
                scanCompleted: true,
                gameName: nextStep
            });
            return { errors: errors, nextStep: nextStep, gameIndex: nextStepIndex };
        },
        handlePayload: function(pageData, dataManager) {
            dataManager.addClue({
                qrText: pageData['qrText'],
                clueText: pageData['qrText']
            });
        }
    },
    game: {
        getNextStepData: function() {
            return { errors: [], nextStep: "scan" };
        }
    }
};