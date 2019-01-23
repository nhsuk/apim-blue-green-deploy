const df = require('durable-functions');

module.exports = df.orchestrator(function* orchestratorFunctionGenerator(context) {
  context.log('Starting GetIndexNamesOrchestrator');
  const apimApiName = context.df.getInput();

  context.log({ apimApiName });

  const indexNames = yield context.df.callActivity('GetIndexNames', apimApiName);

  context.log({ indexNames });

  return indexNames;
});
