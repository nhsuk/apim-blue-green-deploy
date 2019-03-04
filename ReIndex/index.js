const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function reindex(context) {
  const indexName = context.bindings.parameters.indexName;
  const indexerName = context.bindings.parameters.indexerName;
  const searchApiVersion = context.bindings.parameters.searchApiVersion;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  try {
    await azureSearchRequest(`indexes/${indexName}`, {
      body: JSON.stringify(indexDefinition),
      method: 'put',
      searchApiVersion,
    });
    await azureSearchRequest(`indexers/${indexerName}/run`, {
      method: 'post',
      searchApiVersion,
    });
  } catch (e) {
    throw Error(`Could not run indexer '${indexerName}' (404 - "Not Found")`);
  }
};
