const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function reindex(context) {
  const indexName = context.bindings.parameters.indexName;
  const indexerName = context.bindings.parameters.indexerName;
  const searchApiVersion = context.bindings.parameters.searchApiVersion;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  try {
    await azureSearchRequest(`indexes/${indexName}`, searchApiVersion, {
      method: 'delete',
    });
    await azureSearchRequest(`indexes/${indexName}`, searchApiVersion, {
      body: JSON.stringify(indexDefinition),
      method: 'put',
    });
    await azureSearchRequest(`indexers/${indexerName}/run`, searchApiVersion, {
      method: 'post',
    });
  } catch (e) {
    throw Error(`Could not run indexer '${indexerName}' (${e.message})`);
  }
};
