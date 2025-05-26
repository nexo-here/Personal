#!/bin/bash
while true
do
  echo "Starting Ichigo Bot..."
  node index.js
  echo "Bot crashed with exit code $? Restarting in 5 seconds..." >&2
  sleep 5
done
