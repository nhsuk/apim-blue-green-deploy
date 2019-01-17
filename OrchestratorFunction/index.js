const df = require('durable-functions');
const moment = require('moment');

module.exports = df.orchestrator(function* orchestratorFunctionGenerator(context) {
  context.log('Starting Orchestration using Chaining and Monitor patterns');
  const indexNames = yield context.df.callActivity('GetIndexNames');
  context.log({ indexNames });
  const indexerName = yield context.df.callActivity('ReIndex', indexNames);
  context.log({ indexerName });
  const polling = { interval: 60, units: 'seconds' };
  const expiryTime = moment().add(polling.interval * 15, polling.units);

  const idleIndexName = indexNames.idle;
  while (moment.utc(context.df.currentUtcDateTime).isBefore(expiryTime)) {
    // Wait until reindexing is underway before first checking status
    const nextCheck = moment
      .utc(context.df.currentUtcDateTime)
      .add(polling.interval, polling.units);
    yield context.df.createTimer(nextCheck.toDate());
    const indexerStatus = yield context.df.callActivity('GetIndexerStatus', indexerName);
    context.log({ indexerStatus });
    if (indexerStatus === 'success') {
      yield context.df.callActivity('SwitchAliasedIndex', idleIndexName);
      // TODO: send notification
      return 'done';
    } if (indexerStatus !== 'inProgress') {
      return 'failed: indexer failed';
    }
  }

  return 'failed: OrchestratorFunction/index.js timed out';
});
