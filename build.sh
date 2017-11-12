#!/usr/bin/env bash
cd src
npm install
zip -r askJaws.zip . -x package.json
rm -fr ../dist
mkdir ../dist
mv ./askJaws.zip ../dist/askJaws.zip
