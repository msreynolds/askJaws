# AskJaws
Author: Matt Reynolds (matt@mtnlabs.com) and Justin Degonda (jmdegonda@gmail.com)

Project: AskJaws

Description: An Amazon Alexa Skill for the JAWS screen reader.  Ask JAWS for keyboard shortcuts for any action and target

Version: 1.0.0

URL: https://github.com/msreynolds/askjaws

Usage:
```
User: "Alexa, Ask Jaws to Set Preferences"
Alexa: "Ok, what layout preference do you prefer?  Please say laptop or desktop"

User: "Alexa, Ask Jaws: What’s the shortcut for ‘say line’"
Alexa: "They keyboard shortcut for 'say line' is INSERT + UP ARROW"

User: "Alexa, Ask Jaws: What’s the shortcut for ‘say time’"
Alexa: "They keyboard shortcut for 'say line' is INSERT + UP ARROW" (this is due to the Levenstein search implementation.  There is no command for 'say time' so it finds the next closest match)

User: "Alexa, Ask Jaws: What commands contain ‘time’"
Alexa: "I found one command that contains 'time', 'say system time'"

User: "Alexa, Ask Jaws: What’s the shortcut for ‘say system time’"
Alexa: "The keyboard shortcut for 'say system time' is ALT + NUM PAD 5"

User: "Alexa, Ask Jaws: What’s the shortcut for ‘acquire image from scanner or camera’"
Alexa: "The keyboard shortcut for 'acquire image from camera or scanner' is INSERT+SPACEBAR, followed by O, and then A"

User: "Alexa, Ask Jaws: What commands contain ‘radio button’"
Alexa: "I found 4 commands that contain 'radio button' ... then she reads the 4 commands found"

User: "Alexa, Ask Jaws: What’s the shortcut for ‘next radio button’"
Alexa: "The keyboard shortcut for 'next radio button' is A"
```

Instructions:

Prepare your own source code to upload to the Amazon Lambda Function console:

Get the codez, cd into project directory
```
git clone https://github.com/msreynolds/askjaws.git
cd askjaws
```

Rename ```./.env.example``` to ```./.env```

Edit all configuration variables in ```./.env```
```
# Skill Call Sign
SKILL_CALL_SIGN="jaws"

# Amazon Configuration
AMAZON_ALEXA_APP_ID="amzn1.enter.ask.skill.alexa.ID"

# Layout Mode (desktop or laptop)
LAYOUT_MODE="desktop"

# Version Mode (Jaws version)
VERSION_MODE="JFW18"

```

Build the zip file you will upload to Amazon Lambda Function Console, the zip file is stored in ```./dist/askIndigo.zip```:

```
chmod 775 ./build.sh
./build.sh
```

Test your Skill:

Edit the file ```askjaws/test/alexa_requests.json``` with your own Alexa Skill Application ID.

To test your skill, use ONE of the example Sample Events in ```askjaws/test/alexa_requests.json```
