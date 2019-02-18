const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function reindex(context) {
  const indexName = context.bindings.parameters.indexName;
  const indexDefinition = JSON.stringify(context.bindings.parameters.indexDefinition);
  await azureSearchRequest(`indexes/${indexName}`, 'put', indexDefinition);
  await azureSearchRequest(`indexers/${indexName}/run`, 'post');
};
