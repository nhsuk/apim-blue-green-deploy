const azureSearchRequest = require('../lib/AzureSearchRequest');

async function azureIndexesSearchRequest(indexName, method, body) {
  azureSearchRequest(`indexes/${indexName}`, method, body);
}

async function azureIndexersSearchRequest(indexerName, method, body) {
  azureSearchRequest(`indexers/${indexerName}`, method, body);
}

async function recreateIndex(indexName, indexDefinition) {
  await azureIndexesSearchRequest(indexName, 'put', JSON.stringify(indexDefinition));
}

module.exports = async function reindex(context) {
  const indexNames = context.bindings.parameters.indexNames;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  await recreateIndex(indexNames.idle, indexDefinition);
  await azureIndexersSearchRequest(`${indexNames.idle}/run`, 'post');
};
