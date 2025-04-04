#!/bin/sh

DIRECTORY="$PWD/allure-report"

echo "Publishing test results to S3"
if [ -f FAILED ]; then
   cp FAILED "$DIRECTORY/FAILED"
fi

if [ -n "$RESULTS_OUTPUT_S3_PATH" ]; then
   if [ -d "$DIRECTORY" ]; then
      aws s3 cp "$DIRECTORY" "$RESULTS_OUTPUT_S3_PATH" --recursive --quiet
      echo "Test results published to $RESULTS_OUTPUT_S3_PATH"
   else
      echo "$DIRECTORY is not found"
      exit 1
   fi
else
   echo "RESULTS_OUTPUT_S3_PATH is not set"
   exit 1
fi
