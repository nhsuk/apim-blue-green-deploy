const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function getIndexerStatus(context) {
  const indexerName = context.bindings.indexerName;
  try {
    const response = await azureSearchRequest(`indexers/${indexerName}/status`, 'get');
    return response.body.status;
  } catch (e) {
    throw Error(`Could not get status for indexer '${indexerName}' (${e.message})`);
  }
};
