# index-switch

## Prerequisites

azure-functions-core-tools (install using `npm install -g azure-functions-core-tools`)

A `local.setting.json` file with the following values defined:

|Environment Variables|
|---------------------|
|AzureWebJobsStorage|
|FUNCTIONS_WORKER_RUNTIME|
|apim-authorization-token|
|apim-api-version|
|apim-host-name|
|apim-subscription|
|apim-resource-group|
|apim-api-name|
|search-hostname|
|search-api-version|
|search-api-admin-key|

## Start Azure Functions Locally

Clone this repo and from within the top level directory run:
```
func start
```
## Run the orchestration function
```
# if a instance is already running then the following message will be displayed:
#   "An instance with ID '123456789' is already running."
curl -s -XPOST "http://localhost:7071/api/orchestrators/OrchestratorFunction/123456789" -d @body.json | tee response.json
```

```
#the following command will get the status of the function
curl $(jq -r '.statusQueryGetUri' response.json)
```

The function takes about 10 mins to run so the above call starts the function and uses `jq` to capture the Status Check URL.

You can then run the above command periodically to check the status which will be "inProgress" or "Completed".

Notes:
1) The function is a [Durable Function](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)
which uses an [Orchestration Singleton Pattern](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-singletons).
If you try and run the function while it is already running it will return an error (HTTP 409) 

2) The function also uses a [Monitoring Pattern](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-concepts#monitoring)
to monitor the reindexing at 1 minute intervals using a [Timer Activity](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-timers).
In theory this will reduce costs compared to using sleep or wait from within the function.
