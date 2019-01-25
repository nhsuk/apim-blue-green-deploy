const df = require('durable-functions');
const moment = require('moment');

module.exports = df.orchestrator(function* orchestratorFunctionGenerator(context) {
  context.log('Starting ReIndexOrchestrator');
  const input = context.df.getInput();

  context.log({ input });

  const indexNames = input.parameters.indexNames;
  const apimApiName = input.parameters.apimApiName;
  let indexDefinition = input.parameters.indexDefinition;

  if (!indexDefinition) {
    indexDefinition = yield context.df.callActivity('GetIndexDefinition', indexNames.active);
  }
  context.log({ indexDefinition });

  const indexerName = yield context.df.callActivity('ReIndex', { indexDefinition, indexNames });
  context.log({ indexerName });

  const polling = { interval: 60, units: 'seconds' };
  const expiryTime = moment().add(polling.interval * 15, polling.units);

  while (moment.utc(context.df.currentUtcDateTime).isBefore(expiryTime)) {
    // Put wait at beginning of loop rather than end so that reindexing is
    // underway before first checking status
    const nextCheck = moment
      .utc(context.df.currentUtcDateTime)
      .add(polling.interval, polling.units);
    yield context.df.createTimer(nextCheck.toDate());
    const indexerStatus = yield context.df.callActivity('GetIndexerStatus', indexerName);
    context.log({ indexerStatus });
    if (indexerStatus === 'success') {
      yield context.df.callActivity('SwitchAliasedIndex', { apimApiName, idleIndexName: indexNames.idle });
      // TODO: send notification
      return 'done';
    } if (indexerStatus !== 'inProgress') {
      return 'failed: indexer failed';
    }
  }

  return 'failed: OrchestratorFunction/index.js timed out';
});
