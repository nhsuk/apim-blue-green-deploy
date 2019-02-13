const azureSearchRequest = require('../lib/AzureSearchRequest');

async function azureIndexesSearchRequest(indexName, method, body) {
  return azureSearchRequest(`indexes/${indexName}`, method, body);
}

async function azureIndexersSearchRequest(indexerName, method, body) {
  return azureSearchRequest(`indexers/${indexerName}`, method, body);
}

async function recreateIndex(indexName, indexDefinition) {
  await azureIndexesSearchRequest(indexName, 'delete');
  await azureIndexesSearchRequest(indexName, 'put', JSON.stringify(indexDefinition));
  return 'created';
}

module.exports = async function reindex(context) {
  const indexNames = context.bindings.parameters.indexNames;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  await recreateIndex(indexNames.idle, indexDefinition);
  await azureIndexersSearchRequest(`${indexNames.idle}/run`, 'post');
};
