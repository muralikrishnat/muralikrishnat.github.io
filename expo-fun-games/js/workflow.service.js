var workflowService = {
    registration: {
        getPageErrors: function() {
            return [];
        },
        handlePayload: function(pageData, dataManager) {
            console.log("dsfsf", pageData);
            dataManager.save({
                teamName: pageData.teamName,
                firstName: pageData.name,
                lastName: pageData.email,
                phone: pageData.phone
            });
        }
    },
    participate: {
        getNextStepData: function(pageData, stepData, availableGames) {
            var errors = [],
                nextStep = "individual";
            var appData = dataManager.get();
            if (appData && appData.participateType === 'team') {
                nextStep = 'team';
            }
            return { errors: errors, nextStep: nextStep };
        }
    },
    team: {
        handlePayload: function(pageData, dataManager) {
            dataManager.save({
                name: pageData['name'],
                email: pageData['email'],
                phone: pageData['phone'],
                teamName: pageData['teamName']
            });
        },
        getNextStepData: function(pageData, stepData, availableGames) {
            var errors = [],
                nextStep = "rules";
            return { errors: errors, nextStep: nextStep };
        }
    },
    individual: {
        handlePayload: function(pageData, dataManager) {
            dataManager.save({
                name: pageData['name'],
                email: pageData['email'],
                phone: pageData['phone']
            });
        },
        getNextStepData: function(pageData, stepData, availableGames) {
            var errors = [],
                nextStep = "rules";
            return { errors: errors, nextStep: nextStep };
        }
    },
    welcome: {

    },
    scan: {
        getNextStepData: function(pageData, stepData, availableGames) {
            var errors = [],
                nextStep;
            if (pageData['qrText'] && pageData['qrText'].length === 0) {
                errors.push({
                    message: "Please scan for QR code"
                });
            }
            nextStep = "game";
            dataManager.updateLastClue({
                scanCompleted: true,
                gameName: nextStep
            });
            return { errors: errors, nextStep: nextStep, isGame: true, gameIndex: 0 };
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
            var errors = [],
                nextStep = "scan2";
            if ($('[name="gamePuzzle"]').val().length === 0) {
                errors.push({
                    message: "Please Complete the puzzle to move"
                });
            }
            return { errors: errors, nextStep: nextStep };
        }
    },
    scan2: {
        getNextStepData: function(pageData) {
            var errors = [],
                nextStep = "game2";
            if (pageData['qrText'].length === 0) {
                errors.push({
                    message: "Please scan for QR code"
                });
            }
            return { errors: errors, nextStep: nextStep, isGame: true, gameIndex: 1 };
        }
    },
    game2: {
        getNextStepData: function() {
            var errors = [],
                nextStep = "scan3";
            if ($('[name="gamePuzzle"]').val().length === 0) {
                errors.push({
                    message: "Please Complete the puzzle to move"
                });
            }
            return {
                errors: errors,
                nextStep: nextStep
            }
        }
    },
    game3: {
        getNextStepData: function() {
            var errors = [],
                nextStep = "statuspage";
            if ($('[name="gamePuzzle"]').val().length === 0) {
                errors.push({
                    message: "Please Complete the puzzle to move"
                });
            }
            return {
                errors: errors,
                nextStep: nextStep
            }
        }
    },
    scan3: {
        getNextStepData: function(pageData) {
            var errors = [],
                nextStep = "game3";
            if (pageData['qrText'].length === 0) {
                errors.push({
                    message: "Please scan for QR code"
                });
            }
            return { errors: errors, nextStep: nextStep, isGame: true, gameIndex: 2 };
        }
    }
};