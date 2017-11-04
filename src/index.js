/**
 * Created by Matt Reynolds (matt@mtnlabs.com) and Justin Degonda (jmdegonda@gmail.com).
 * Mountain Labs, LLC 2017 (mtnlabs.com)
 *
 * Project: ASKIndigo
 * An Amazon Alexa Skill for Indigo Domotics Home Automation system
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
		getWelcomeResponse();
	},
	'SessionStartedRequest': function (session) {
		console.log('Session Started Intent', session);
	},
	'SessionEndedRequest': function (session) {
		console.log('Session Ended Intent', session);
	},
	'AMAZON.HelpIntent': function () {
		console.log('AMAZON Help Intent');
		getHelpResponse();
	},
	'KeyboardShortcutIntent': function () {
		console.log('Keyboard Shortcut Intent');
		getKeyboardShortcut(this.event.request.intent, this.emit);
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

/**
 * Behavior Functions
 */

/** welcome response */
function getWelcomeResponse() {
	getHelpResponse();
}

/** help response */
function getHelpResponse() {
	var speechOutput = "You can change ask for the keyboard shortcut for any operation.  What " + process.env.SKILL_CALL_SIGN + " keyboard shortcut would like to know?";
	var repromptText = "I did not understand you, what " + process.env.SKILL_CALL_SIGN + " keyboard shortcut would you like to know?";
	this.emit(':ask', speechOutput, repromptText);
}

/** sets a device value */
function getKeyboardShortcut(intent, speechCallback) {


}

/** returns the proper speech output */
function getSpeechOutput(error, body, slotValue, requestType) {

	if (error) {
		return "There was an error";
	}

	var result = "Ok";

	return result;
}