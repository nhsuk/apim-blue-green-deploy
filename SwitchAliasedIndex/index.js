const azureApimRequest = require('../lib/AzureApimRequest');
const azureSearchUrl = require('../lib/AzureSearchUrl');

module.exports = async function switchAliasedIndex(context) {
  const apiDefinition = await azureApimRequest();
  const serviceUrl = azureSearchUrl(`indexes/${context.bindings.idleIndexName}/docs/`);
  context.log({ serviceUrl });
  apiDefinition.properties.serviceUrl = serviceUrl;
  await azureApimRequest('put', JSON.stringify(apiDefinition));
  return 'switched';
};
