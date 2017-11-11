/**
 * Created by Matt Reynolds (matt@mtnlabs.com) and Justin Degonda (jmdegonda@gmail.com).
 * Mountain Labs, LLC 2017 (mtnlabs.com)
 *
 * Project: AskJaws
 * An Amazon Alexa Skill for the JAWS screen reader.  Ask JAWS for keyboard shortcuts for any action and target
 */

'use strict';

require('dotenv').load();

var fs = require('fs');
const util = require('util');
var dataModel = require('./data/data.json');

// var util = require('util'); // useful for debugging/printing json objects
var Alexa = require('alexa-sdk');

exports.handler = function (event, context) {
	var alexa = Alexa.handler(event, context);
	alexa.APP_ID = process.env.AMAZON_ALEXA_APP_ID;
	alexa.registerHandlers(handlers);
	alexa.execute();
};

var handlers = {
	'LaunchRequest': function () {
		console.log('Launch Request Intent');
		getWelcomeResponse(this.emit);
	},
	'SessionStartedRequest': function (session) {
		console.log('Session Started Intent', session);
	},
	'SessionEndedRequest': function (session) {
		console.log('Session Ended Intent', session);
	},
	'AMAZON.HelpIntent': function () {
		console.log('AMAZON Help Intent');
		getHelpResponse(this.emit);
	},
	'KeyboardShortcutIntent': function () {
		//console.log('Keyboard Shortcut Action/Target Intent:');
		//console.log(util.inspect(this.event.request.intent, {showHidden: false, depth: null}));
		getKeyboardShortcut(this.event.request.intent, this.emit);
	},
	'AMAZON.CancelIntent': function () {
		console.log('AMAZON Cancel Intent');
		//this.emit(':tell', 'Ok, I will cancel that request.');
	},
	'AMAZON.StopIntent': function () {
		console.log('AMAZON Stop Intent');
		//this.emit(':tell', 'Ok, I will stop that request.');
	}
};

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

	var result;
	if (process.env.VERBOSE_MODE === 'true') {
		// Ask the user if the action/target pair were interpreted correctly
		result = "You want the keyboard shortcut for " + operation + ", is that correct?";
	} else {
		// Lookup action/target pair in the data model
		result = getShortcutForOperation(operation);
	}
	return result;
};

/** does a data model lookup for the given key (action, target pair), if found, returns corresponding value */
function getShortcutForOperation(operation) {

	// The keyboard shortcuts are different for desktop and laptop layouts
	var layout = process.env.LAYOUT_MODE; // either 'desktop' or 'laptop'

	//console.log('dataModel: ' + util.inspect(dataModel, {showHidden: false, depth: null}));

	var exactMatchKey = null;
	var substringMatchKeys = [];
	var shortestDistance = operation.length;
	var shortestDistanceKey = null;

	Object.keys(dataModel).forEach(function (key) {

		// Make a 'clean' key, aka remove all non-alpha numeric characters
		var cleanKey = key.replace(/[\W_]+/g,'');

		// Exact match of operation to key or cleanKey
		if (key === operation || cleanKey === operation) {
			console.log('Exact Match Found!');
			exactMatchKey = key;
			return;
		}

		// Exact match of operation within a substring of key
		var substringKeyMatches = key.match(new RegExp('/'+operation+'/g'));
		if (substringKeyMatches && substringKeyMatches.length === 1) {
			console.log('Substring Match Found in Key: ' + key);
			substringMatchKeys.push(key);
		}

		// Exact match of operation within a substring of cleanKey
		var substringCleanKeyMatches = cleanKey.match(new RegExp('/'+operation+'/g'));
		if (substringCleanKeyMatches && substringCleanKeyMatches.length === 1) {
			console.log('Substring Match Found in Cleaned Key: ' + cleanKey);
			substringMatchKeys.push(key);
		}

		// Shortest Levenshtein Distance match between cleanKey and operation
		var distance = getLevenshteinDistance(cleanKey, operation);
		if (distance < shortestDistance) {
			shortestDistance = distance;
			console.log('Searching for: ' + operation);
			console.log('Shorter Levenshtein Distance Match Found in Cleaned Key: ' + key + ' ' + distance);
			shortestDistanceKey = key;
		}
	});

	// Key Weighting Algorithm:
	// 1) always use exact match if it exists
	// 2) always use the shortest distance on an exact substring match, if substring matches were found
	// 3) always use the shortest distance match, if a distance shorter than the operation phrase length was found
	// 4) else report that there was no match found

	if (exactMatchKey){
		// 1) always use exact match if it exists
		return "The keyboard shortcut for " + exactMatchKey + " is " + dataModel[exactMatchKey];
	}
	else if (substringMatchKeys && substringMatchKeys.length > 0) {
		// 2) always use the shortest distance on an exact substring match, if substring matches were found
		var substringMatchKey = getShortestDistanceSubstringKey(substringMatchKeys, operation);
		return "The keyboard shortcut for " + substringMatchKey + " is " + dataModel[substringMatchKey];
	}
	else if (shortestDistance < operation.length) {
		// 3) always use the shortest distance match, if a distance shorter than the operation phrase length was found
		return "The keyboard shortcut for " + shortestDistanceKey + " is " + dataModel[shortestDistanceKey];
	}
	else {
		// 4) else report that there was no match found
		return "I did not find any keyboard shortcuts for " + operation;
	}

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

function getShortestDistanceSubstringKey(substringMatchKeys, operation) {
	var longestKeyLength = 0;
	var shortestSubstringDistanceKey = null;

	substringMatchKeys.forEach(function(substringMatchKey) {
		if (substringMatchKey.length > longestKeyLength) {
			// find the longest key
			longestKeyLength = substringMatchKey.length;

			// set the default substring key to the longest key found
			shortestSubstringDistanceKey = substringMatchKey;
		}
	});

	// Now try to find a key with a shorter Levenshtein distance to the original operation
	var shortestSubstringDistance = longestKeyLength;
	substringMatchKeys.forEach(function(substringMatchKey) {
		var substringDistance = getLevenshteinDistance(substringMatchKey, operation);
		if (substringDistance < shortestSubstringDistance) {
			shortestSubstringDistance = substringDistance;
			shortestSubstringDistanceKey = substringMatchKey;
		}
	});

	return shortestSubstringDistanceKey
};