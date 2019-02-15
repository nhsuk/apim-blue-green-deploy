const chai = require('chai');
const crypto = require('crypto');
const generateApimSasToken = require('../../../lib/generateApimSasToken');

const expect = chai.expect;

function generateSignature(key, identifier, expiry) {
  const hmac = crypto.createHmac('sha512', key);
  const stringToSign = `${identifier}\n${expiry}`;
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

describe('generateApimSasToken', () => {
  const identifier = 'not-a-real-identifier';
  const key = 'not-a-real-key';

  before('setup', () => {
    process.env['apim-api-key'] = key;
    process.env['apim-api-identifier'] = identifier;
  });

  after('tear down ', () => {
    process.env['apim-api-key'] = null;
    process.env['apim-api-identifier'] = null;
  });

  it('it should return a correctly formatted SAS token', () => {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 5);
    const sasToken = generateApimSasToken(expiryDate);

    expect(sasToken).to.not.be.null;
    const sasSplit = sasToken.split(' ');
    expect(sasSplit[0]).to.equal('SharedAccessSignature');

    const parameters = sasSplit[1].split('&');
    const expectedExpiry = `${expiryDate.toISOString().slice(0, -1)}0000Z`;
    const expectedSignature = generateSignature(key, identifier, expectedExpiry);
    expect(parameters[0]).to.equal(`uid=${identifier}`);
    expect(parameters[1]).to.equal(`ex=${expectedExpiry}`);
    expect(parameters[2]).to.equal(`sn=${expectedSignature}`);
  });
});
