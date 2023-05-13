#!/usr/bin/env bash

export IS_UNITTEST=true
SCRIPT_BASEDIR=$(dirname "$0")
cd "${SCRIPT_BASEDIR}/.."

rm -rf tmp/tests
mkdir -p tmp/tests

echo -n '["tests.fluxchat.dev:25001"]' > tmp/tests/bootstrap.json

set -e
npm run build
npm run test
