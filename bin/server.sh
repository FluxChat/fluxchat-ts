#!/usr/bin/env bash

SCRIPT_BASEDIR=$(dirname "$0")
cd "${SCRIPT_BASEDIR}/.."

which node &> /dev/null || { echo 'ERROR: node not found in PATH'; exit 1; }

#export ALLOW_SELF_CONNECT=1 # only for development
node ./build/src/app/server_app.js -c var/config1.json
