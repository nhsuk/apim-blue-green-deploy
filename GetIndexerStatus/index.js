const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function getIndexerStatus(context) {
  const indexerName = context.bindings.parameters.indexerName;
  const searchApiVersion = context.bindings.parameters.searchApiVersion;
  try {
    const response = await azureSearchRequest(`indexers/${indexerName}/status`, searchApiVersion);
    return response.body.status;
  } catch (e) {
    throw Error(`Could not get status for indexer '${indexerName}' (${e.message})`);
  }
};
