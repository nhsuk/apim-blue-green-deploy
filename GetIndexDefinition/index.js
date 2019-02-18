const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function index(context) {
  const indexName = context.bindings.indexName;
  const response = await azureSearchRequest(`indexes/${indexName}`, 'get');
  const indexDefinition = response.body;
  // We delete the index name to allow us to 'put' the index definition to any named index
  delete indexDefinition.name;
  return indexDefinition;
};
