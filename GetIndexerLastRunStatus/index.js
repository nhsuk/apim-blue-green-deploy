const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function getIndexerLastRunStatus(context) {
  const indexerName = context.bindings.parameters.indexerName;
  const searchApiVersion = context.bindings.parameters.searchApiVersion;
  try {
    const response = await azureSearchRequest(`indexers/${indexerName}/status`, { searchApiVersion });
    return response.body.lastResult.status;
  } catch (e) {
    throw Error(`Could not get last run status for indexer '${indexerName}' (${e.message})`);
  }
};
