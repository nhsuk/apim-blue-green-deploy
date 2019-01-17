const rp = require('request-promise-native');

module.exports = async function (method = 'get', body) {
  const apimApiVersion = process.env['apim-api-version'];
  const apimAuthorizationToken = process.env['apim-authorization-token'];
  const apimHostName = process.env['apim-host-name'];
  const apimServiceName = process.env['apim-service-name'];
  const apimSubscription = process.env['apim-subscription'];
  const apimResourceGroup = process.env['apim-resource-group'];
  const apimApiName = process.env['apim-api-name'];

  const headers = {
    'Content-Type': 'application/json',
    Authorization: apimAuthorizationToken,
  };
  const url = `https://${apimHostName}/subscriptions/${apimSubscription}/resourceGroups/${apimResourceGroup}/providers/Microsoft.ApiManagement/service/${apimServiceName}/apis/${apimApiName}?api-version=${apimApiVersion}`;

  const response = await rp({
    body,
    headers,
    method,
    url,
  });

  return JSON.parse(response);
};
