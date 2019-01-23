# Azure API Manager Blue Green Deploy Function App

## Installation

* Install
[Azure Functions Core Tools version 2.x](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools)
for your development platform
* Clone the repository - `git clone https://github.com/nhsuk/apim-blue-green-deploy.git`
* Install npm dependencies - `npm install`
* Rename [example.local.settings.json](example.local.settings.json) to
  [local.settings.json](local.settings.json) and edit the file to include valid
  values
* Install Function Runtime extensions - `func extensions install`

## Run the Azure Functions locally

* Start the Function app - `func start`

## Execute the orchestration function

### MacOS/Linux
```
# if a instance is already running then the following message will be displayed:
#   "An instance with ID '123456789' is already running."
curl -s -XPOST "http://localhost:7071/api/orchestrators/OrchestratorFunction/123456789" -d @body.json | tee response.json
```
The function takes about 10 mins to run so the above call return with a 202 after starting the function.
```
#the following command will get the status of the function
curl $(jq -r '.statusQueryGetUri' response.json)
```
The above command uses `jq` to query using the Status Check URL. Run it periodically to return the function status (typically it will be "inProgress" or "Completed").

### Windows

_powershell samples here - TBC_

## Notes
1) The function is a
[Durable Function](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)
which uses an
[Orchestration Singleton Pattern](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-singletons).
If you try and run the function while it is already running it will return an
error (HTTP 409)

2) The function also uses a
[Monitoring Pattern](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-concepts#monitoring)
to monitor the reindexing at 1 minute intervals using a
[Timer Activity](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-timers).
In theory this will reduce costs compared to using sleep or wait from within
the function.


## Troubleshooting

* If an [EPROTO](https://github.com/Azure/azure-functions-durable-js/issues/28)
  error is reported when running `func start` ensure the latest version of the
  runtime and extensions are installed. Updating the runtime to the latest
  version will depend on how it was originally installed as will upgrading the
  function extensions.
