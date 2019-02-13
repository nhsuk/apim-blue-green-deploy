const df = require('durable-functions');

module.exports = df.orchestrator(function* orchestratorFunctionGenerator(context) {
  const input = context.df.getInput();
  context.log({ input });

  const apimApiName = input.parameters.apimApiName;

  context.log('Starting Orchestration using Chaining and Monitor patterns');

  const indexNames = yield context.df.callSubOrchestrator(
    'GetIndexNamesOrchestrator',
    apimApiName,
    `${context.df.instanceId}:0`
  );
  context.log({ indexNames });

  const parameters = {
    apimApiName,
    indexNames,
  };
  const returnStatus = yield context.df.callSubOrchestrator(
    'ReIndexOrchestrator',
    { parameters },
    `${context.df.instanceId}:0`
  );
  context.log({ returnStatus });

  return returnStatus;
});
