# AskJaws
Author: Matt Reynolds (matt@mtnlabs.com) and Justin Degonda (jmdegonda@gmail.com)

Project: AskJaws

Description: An Amazon Alexa Skill for the JAWS screen reader.  Ask JAWS for keyboard shortcuts for any action and target

Version: 1.0.0

URL: https://github.com/msreynolds/askjaws

Usage:
```
echo user: "Alexa, ask jaws What is the keyboard shortcut for 'say line'"
Alexa: "They keyboard shortcut for 'say line' is INSERT + UP ARROW"
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
AMAZON_ALEXA_APP_ID="amzn1.echo-sdk-ams.app.some-amazon-id"

# Verbose Mode
VERBOSE_MODE="false"

# Layout Mode (desktop or laptop)
LAYOUT_MODE="desktop"

```

Build the zip file you will upload to Amazon Lambda Function Console, the zip file is stored in ```./dist/askIndigo.zip```:

```
chmod 775 ./build.sh
./build.sh
```

Test your Skill:

Edit the file ```askjaws/test/alexa_requests.json``` with your own Alexa Skill Application ID.

To test your skill, use ONE of the example Sample Events in ```askjaws/test/alexa_requests.json```
