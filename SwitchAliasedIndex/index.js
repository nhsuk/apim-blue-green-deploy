const azureApimRequest = require('../lib/AzureApimRequest');

module.exports = async function switchAliasedIndex(context) {
  const apiDefinition = await azureApimRequest();
  apiDefinition.properties.serviceUrl = context.bindings.idleIndexUrl;
  await azureApimRequest('put', JSON.stringify(apiDefinition));
  return 'switched';
};
