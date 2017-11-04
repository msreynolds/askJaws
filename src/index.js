/**
 * Created by Matt Reynolds (matt@mtnlabs.com) and Justin Degonda (jmdegonda@gmail.com).
 * Mountain Labs, LLC 2017 (mtnlabs.com)
 *
 * Project: AskJaws
 * An Amazon Alexa Skill for the JAWS screen reader.  Ask JAWS for keyboard shortcuts for any action and target
 */

'use strict';

require('dotenv').load();
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
		console.log('Keyboard Shortcut Intent');
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
}

/** help response */
function getHelpResponse(speechCallback) {
	var speechOutput = "You can ask " + process.env.SKILL_CALL_SIGN + " for the keyboard shortcut for any operation.  What " + process.env.SKILL_CALL_SIGN + " operation would you like to know the keyboard for?";
	speechCallback(':tell', speechOutput, getRepromptText());
}

function getRepromptText() {
	return "I did not understand you, what " + process.env.SKILL_CALL_SIGN + " keyboard shortcut would you like to know?";
}

/** sets a device value */
function getKeyboardShortcut(intent, speechCallback) {

	var action = intent.slots.ActionName.value;
	var target = intent.slots.ActionTarget.value;
	var speechOutput = getSpeechOutput(action, target);

	speechCallback(':tell', speechOutput, getRepromptText());
}

/** returns the proper speech output */
function getSpeechOutput(action, target) {

	// if (error) {
	// 	return "There was an error";
	// }

	var result = "You want the keyboard shortcut for " + action + " " + target + ", is that correct?";

	return result;
}