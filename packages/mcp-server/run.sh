#!/bin/bash
# Local development only - NOT published to npm
export DROP_TOKEN="a5s6akyyjpwu"
exec node "$(dirname "$0")/dist/index.js"
