module.exports = function* orchestratorFunctionGenerator(context) {
  context.log('Starting GetIndexNamesOrchestrator');
  const input = context.df.getInput();

  context.log({ input });

  const indexNames = yield context.df.callActivity('GetIndexNames', input.apimApiName);

  context.log({ indexNames });

  return indexNames;
};
