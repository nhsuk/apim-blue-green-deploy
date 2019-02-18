const df = require('durable-functions');
const moment = require('moment');

module.exports = df.orchestrator(function* orchestratorFunctionGenerator(context) {
  context.log('Starting ReIndexOrchestrator');
  const input = context.df.getInput();

  context.log({ input });

  const indexNames = input.parameters.indexNames;
  const apimApiName = input.parameters.apimApiName;

  // Because of the naming convention which applies the same name to the indexer and data source
  // as for the index we can do this
  const indexerName = indexNames.idle;

  if (yield context.df.callActivity('GetIndexerStatus', indexerName) === 'inProgress') {
    return 'failed: indexer currently running';
  }

  const indexDefinition = yield context.df.callActivity('GetIndexDefinition', indexNames.active);
  context.log({ indexDefinition });

  yield context.df.callActivity('ReIndex', { indexDefinition, indexName: indexNames.idle });

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
      return 'done';
    }
    if (indexerStatus !== 'inProgress') {
      throw new Error(`reindexing failed: indexerStatus=${indexerStatus}`);
    }
  }

  throw new Error('reindexing failed: timed out');
});
