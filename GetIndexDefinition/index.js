const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function index(context) {
  const indexName = context.bindings.parameters.indexName;
  const searchApiVersion = context.bindings.parameters.searchApiVersion;
  try {
    const response = await azureSearchRequest(`indexes/${indexName}`, 'get', undefined, searchApiVersion);
    const indexDefinition = response.body;
    // We delete the index name to allow us to 'put' the index definition to any named index
    delete indexDefinition.name;
    return indexDefinition;
  } catch (e) {
    throw Error(`Could not get index definition for index '${indexName}' (${e.message})`);
  }
};
