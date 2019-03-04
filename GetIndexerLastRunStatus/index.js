const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function getIndexerLastRunStatus(context) {
  const indexerName = context.bindings.indexerName;
  try {
    const response = await azureSearchRequest(`indexers/${indexerName}/status`, 'get');
    return response.body.lastResult.status;
  } catch (e) {
    throw Error(`Could not get last run status for indexer '${indexerName}' (${e.message})`);
  }
};
