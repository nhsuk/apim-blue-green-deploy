const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function reindex(context) {
  const indexName = context.bindings.parameters.indexName;
  const indexerName = context.bindings.parameters.indexerName;
  const searchApiVersion = context.bindings.parameters.searchApiVersion;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  try {
    await azureSearchRequest(`indexes/${indexName}`, 'put', JSON.stringify(indexDefinition), searchApiVersion);
    await azureSearchRequest(`indexers/${indexerName}/run`, 'post', undefined, searchApiVersion);
  } catch (e) {
    throw Error(`Could not run indexer '${indexerName}' (404 - "Not Found")`);
  }
};
