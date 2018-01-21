/**
 * Created by Matt Reynolds (matt@mtnlabs.com) and Justin Degonda (jmdegonda@gmail.com).
 * Mountain Labs, LLC 2018 (mtnlabs.com)
 *
 * Project: AskJaws
 * An Amazon Alexa Skill for the JAWS screen reader.  Ask JAWS for keyboard shortcuts for any action and target
 */

'use strict';

require('dotenv').load();

var fs = require('fs');
var dataModel = require('./data/data.json');
var Alexa = require('alexa-sdk');
const util = require('util');
//console.log(util.inspect(this.event.request, {showHidden: false, depth: null}));

exports.handler = function (event, context) {
	var alexa = Alexa.handler(event, context);
	alexa.APP_ID = process.env.AMAZON_ALEXA_APP_ID;
	alexa.registerHandlers(handlers, setLayoutPreferenceHandlers);
	alexa.execute();
};

var states = {
	LAYOUT_PREFERENCE_MODE: '_LAYOUT_PREFERENCE_MODE'
};

var handlers = {
	'LaunchRequest': function () {
		console.log('Launch Request Intent');
		getWelcomeResponse(this.emit);
	},
	'SessionStartedRequest': function () {
		console.log('Session Started Intent');
	},
	'SessionEndedRequest': function () {
		console.log('Session Ended Intent');
	},
	'AMAZON.HelpIntent': function () {
		console.log('AMAZON Help Intent');
		getHelpResponse(this.emit);
	},
	'KeyboardShortcutIntent': function () {
		getKeyboardShortcut(this.event.request.intent, this.emit);
	},
	'SetPreferencesIntent': function () {
		this.handler.state = states.LAYOUT_PREFERENCE_MODE;
		var speechOutput = "Ok, What layout preference do you prefer?  Please say 'laptop' or 'desktop'";
		this.response.speak(speechOutput).listen("Please say 'laptop' or 'desktop'");
        // this.emit(':tell', speechOutput);
		this.emit(':responseReady');
	},
	'AMAZON.CancelIntent': function () {
		console.log('AMAZON Cancel Intent');
		this.emit(':tell', 'Ok, I will cancel that request.');
	},
	'AMAZON.StopIntent': function () {
		console.log('AMAZON Stop Intent');
		this.emit(':tell', 'Ok, I will stop that request.');
	}
};

var setLayoutPreferenceHandlers = Alexa.CreateStateHandler(states.LAYOUT_PREFERENCE_MODE, {
    'CaptureLayoutPreferenceIntent': function () {
        var layoutPreference = this.event.request.intent.slots.LayoutPreference.value;
        this.attributes["layoutPreference"] = layoutPreference;

    	var speechOutput = "Ok, your layout preference is " + layoutPreference + ".";
    	var nextPreference = "What jaws version are you using?  Please say '17' or '18'";

    	this.response.speak(speechOutput + " " + nextPreference).listen("Please say '17' or '18'");
		this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        console.log('AMAZON Stop Intent');
        this.emit(':tell', 'Ok, I will stop that request.');
    },
    'SessionEndedRequest': function () {
        console.log('Session Ended Intent');
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':tell', 'I have encountered an unhandled request.');
    }
});

/**
 * Behavior Functions
 */

/** welcome response */
function getWelcomeResponse(speechCallback) {
	getHelpResponse(speechCallback);
};

/** help response */
function getHelpResponse(speechCallback) {
	var speechOutput = "You can ask " + process.env.SKILL_CALL_SIGN + " for the keyboard shortcut for any operation.";
	speechCallback(':tell', speechOutput, getRepromptText());
};

function getRepromptText() {
	return "I did not understand you, what " + process.env.SKILL_CALL_SIGN + " keyboard shortcut would you like to know?";
};

/** get the keyboard shortcut */
function getKeyboardShortcut(intent, speechCallback) {

	var speechOutput = getSpeechOutput(intent.slots.OperationName.value);
	speechCallback(':tell', speechOutput, getRepromptText());
};

/** returns the proper speech output */
function getSpeechOutput(operation) {
	return getResponse(findClosestMatchingDescription(operation), operation);
};

/** does a data model lookup for the given key (operation), if found, returns corresponding value */
function findClosestMatchingDescription(operation) {

	var exactMatchDescription = null;
	var shortestDistanceDescription = null;
	var shortestDistance = operation.length;

	var dataModelArray = (process.env.LAYOUT_MODE === 'laptop') ? (dataModel.desktop) : (dataModel.laptop);

	dataModelArray.forEach(function (item) {
		// Make a 'clean' description, aka remove all non-alpha numeric characters
		var cleanDescription = item.description.replace(/[\W_]+/g,'');

		// Exact match of operation to description or cleanDescription
		if (item.description === operation || cleanDescription === operation) {
			console.log('Exact Match Found!');
			exactMatchDescription = item.description;
			return;
		}

		// Shortest Levenshtein Distance match between cleanDescription and operation
		var distance = getLevenshteinDistance(cleanDescription, operation);
		if (distance < shortestDistance) {
			shortestDistance = distance;
			console.log('Searching for: ' + operation);
			console.log('Shorter Levenshtein Distance Match Found in Clean Description: ' + item.description + ' - ' + distance);
			shortestDistanceDescription = item.description;
		}
	});

	// Key Weighting Algorithm:
	// 1) always use exact match if it exists
	// 2) otherwise, always use the shortest distance match, if a distance shorter than the operation phrase length was found

	if (exactMatchDescription) return exactMatchDescription;
	if (shortestDistanceDescription) return shortestDistanceDescription;

	return null;
};

// Credit: https://gist.github.com/andrei-m/982927
function getLevenshteinDistance(a, b){

	if(a.length == 0) return b.length;
	if(b.length == 0) return a.length;

	var matrix = [];

	// increment along the first column of each row
	var i;
	for(i = 0; i <= b.length; i++){
		matrix[i] = [i];
	}

	// increment each column in the first row
	var j;
	for(j = 0; j <= a.length; j++){
		matrix[0][j] = j;
	}

	// Fill in the rest of the matrix
	for(i = 1; i <= b.length; i++){
		for(j = 1; j <= a.length; j++){
			if(b.charAt(i-1) == a.charAt(j-1)){
				matrix[i][j] = matrix[i-1][j-1];
			} else {
				matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
					Math.min(matrix[i][j-1] + 1, // insertion
						matrix[i-1][j] + 1)); // deletion
			}
		}
	}

	return matrix[b.length][a.length];
};

function getCommand(description) {
	// The keyboard shortcuts are different for desktop and laptop layouts
	var dataModelArray = (process.env.LAYOUT_MODE === 'laptop') ? (dataModel.laptop) : (dataModel.desktop);

	var result = null;
	dataModelArray.forEach(function (item) {
		if (description == item.description) {
			result = item.command;
			return;
		}
	});
	return result;
};

function getResponse(description, operation) {

	var command = getCommand(description);
	if (command) {
		return "The keyboard shortcut for " + description + " is " + command;
	} else {
		return "I did not find any keyboard shortcuts for " + operation;
	}
};

