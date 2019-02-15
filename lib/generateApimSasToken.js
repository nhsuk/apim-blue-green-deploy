const crypto = require('crypto');

function generateDateTimeString(date) {
  // The representation of date and time must be in microseconds -
  // https://docs.microsoft.com/en-us/rest/api/apimanagement/apimanagementrest/azure-api-management-rest-api-authentication
  // As per the 'Round-trip' format -
  // https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#the-round-trip-o-o-format-specifier
  // JS Date is only precise to milliseconds. The value beyond milliseconds is
  // not important for this use case. It is therefore possible to simply pad
  // the string with an extra 4 digits.
  return `${date.toISOString().slice(0, -1)}0000Z`;
}

function generateSignature(identifier, expiry) {
  const key = process.env['apim-api-key'];
  const hmac = crypto.createHmac('sha512', key);
  const stringToSign = `${identifier}\n${expiry}`;
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

function generateApimSasToken(expiryDate) {
  const identifier = process.env['apim-api-identifier'];
  const expiry = generateDateTimeString(expiryDate);
  const signature = generateSignature(identifier, expiry);
  const sasToken = `SharedAccessSignature uid=${identifier}&ex=${expiry}&sn=${signature}`;
  return sasToken;
}

module.exports = generateApimSasToken;
