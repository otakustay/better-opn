#!/bin/bash

osascript << EOF
# build the output with this variable
set titleString to ""

# Apple Script must be able to compile tell statments
# which mean's they can't be variable in Apple Script its self
# but not Bash ;)
tell application "$1"
  close every window
end tell
EOF
