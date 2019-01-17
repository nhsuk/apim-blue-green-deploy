const df = require('durable-functions');
const moment = require('moment');

module.exports = df.orchestrator(function* orchestratorFunctionGenerator(context) {
  // TODO: validate input
  const input = context.df.getInput();

  context.log({ input });
  context.log('Starting Orchestration using Chaining and Monitor patterns');

  const indexNames = yield context.df.callActivity('GetIndexNames', input.apimApiName);
  context.log({ indexNames });

  const indexerName = yield context.df.callActivity('ReIndex', indexNames);
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
      const parameters = {
        apimApiName: input.apimApiName,
        idleIndexName: indexNames.idle,
      };
      yield context.df.callActivity('SwitchAliasedIndex', parameters);
      // TODO: send notification
      return 'done';
    } if (indexerStatus !== 'inProgress') {
      return 'failed: indexer failed';
    }
  }

  return 'failed: OrchestratorFunction/index.js timed out';
});
