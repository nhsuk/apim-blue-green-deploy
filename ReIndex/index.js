const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function reindex(context) {
  const indexName = context.bindings.parameters.indexName;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  await azureSearchRequest(`indexes/${indexName}`, 'put', JSON.stringify(indexDefinition));
  await azureSearchRequest(`indexers/${indexName}/run`, 'post');
};
