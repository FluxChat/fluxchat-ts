#!/usr/bin/env bash

export IS_UNITTEST=true
SCRIPT_BASEDIR=$(dirname "$0")
cd "${SCRIPT_BASEDIR}/.."

rm -rf tmp/tests

set -e
npm run build
npm run test
