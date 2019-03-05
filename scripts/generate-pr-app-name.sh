#!/bin/bash

BUILD_SOURCEBRANCH_SPLIT=(${BUILD_SOURCEBRANCH//// })

# PR_NUMBER will be the number of PR when the branch is a PR branch and in the format of `refs/pull/XXX/merge'
PR_NUMBER=${BUILD_SOURCEBRANCH_SPLIT[2]}
echo "PR_NUMBER: '$PR_NUMBER'."

APP_NAME="$APP_NAME$PR_NUMBER"
echo "APP_NAME: '$APP_NAME'."

TASK_HUB_NAME="${TASK_HUB_NAME}${PR_NUMBER}"
echo "TASK_HUB_NAME: '$TASK_HUB_NAME'."
# Set APP_NAME for use in down stream tasks
# https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables?view=azdevops&tabs=shell#set-in-script
echo "##vso[task.setvariable variable=APP_NAME]$APP_NAME"
echo "##vso[task.setvariable variable=TASK_HUB_NAME]$TASK_HUB_NAME"
