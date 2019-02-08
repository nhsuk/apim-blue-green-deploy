#!/bin/bash

get_vault_data() {
  VAULT_PATH="$1"

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Vault-Token: ${VAULT_TOKEN}" -X GET "https://${VAULT_SERVER}${VAULT_PATH}")
  echo "Retrieving variables from path: '${VAULT_PATH}'. Got status: '${HTTP_STATUS}'."
  if [ "$HTTP_STATUS" = "200" ]; then
    DATA=$( curl -s  \
        -H "X-Vault-Token: ${VAULT_TOKEN}" \
        -X GET \
        "https://${VAULT_SERVER}${VAULT_PATH}" \
    )
  fi
  echo "$DATA" | jq -r '.data | to_entries[] | [ .key, .value|tostring ] | ("##vso[task.setvariable variable="+.[0]+"]"+.[1])'
}

# CHECK VAULT PATH EXISTS
if [ -z "$VAULT_SERVER" ]; then
  echo "VAULT_SERVER not set, skipping vault config"
  SKIP="1"
fi

# CHECK VALUT TOKEN EXISTS
if [ -z "$VAULT_TOKEN" ]; then
  echo "VAULT_TOKEN not set, skipping vault config"
  SKIP="1"
fi

# CHECK ENVIRONMENT NAME EXISTS
# Within Vault this is the name of the environment e.g. dev, production, staging, etc.
# The name of stage to which deployment is currently in progress
if [ -z "$RELEASE_ENVIRONMENTNAME" ]; then
  echo "RELEASE_ENVIRONMENTNAME not set, skipping environment config"
  SKIP="1"
fi

# WHEN RELEASE_ENVIRONMENTNAME=review, USE DEV
# This saves having to setup a secret within /review but allows the differentiation
# between review apps and those built from master branch
if [ "$RELEASE_ENVIRONMENTNAME" == "review" ]; then
  RELEASE_ENVIRONMENTNAME="dev"
fi

# CHECK PROJECT NAME EXISTS
# Within Vault this is the name of the secret (or application) e.g. nhsuk.apim-blue-green-deploy
# The name of the build pipeline
if [ -z "$BUILD_DEFINITIONNAME" ]; then
  echo "BUILD_DEFINITIONNAME not set, skipping environment config"
  SKIP="1"
fi

if [ "$SKIP" != "1" ]; then
  # GET DEFAULT VARIABLES
  VAULT_PATH="/v1/secret/defaults"
  get_vault_data "$VAULT_PATH"

  # GET DEFAULT ENVIRONMENT VARIABLES
  VAULT_PATH="/v1/secret/$RELEASE_ENVIRONMENTNAME/defaults"
  get_vault_data "$VAULT_PATH"

  # GET APPLICATION VARIABLES
  VAULT_PATH="/v1/secret/defaults/$BUILD_DEFINITIONNAME/env-vars"
  get_vault_data "$VAULT_PATH"

  # GET ENVIRONMENT SPECIFIC APPLICATION VARIABLES
  VAULT_PATH="/v1/secret/${RELEASE_ENVIRONMENTNAME}/$BUILD_DEFINITIONNAME/env-vars"
  get_vault_data "$VAULT_PATH"
fi
