const azureApimRequest = require('../lib/AzureApimRequest');

module.exports = async function(context) {

  const apiDefinition = await azureApimRequest();
  apiDefinition.properties.serviceUrl = context.bindings.idleIndexUrl
  const postResponse = await azureApimRequest('put', JSON.stringify(apiDefinition));
  return 'switched'
};
