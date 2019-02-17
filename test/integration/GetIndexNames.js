const chai = require('chai');
const localSettings = require('../../local.settings.json');
const getIndexNames = require('../../GetIndexNames/index');

const expect = chai.expect;

describe('GetIndexNames', () => {
  it('it should return names', async () => {
    const context = {
      log: () => {},
    };
    process.env = localSettings.Values;
    const response = await getIndexNames(context, 'service-search-organisations');
    expect(response).to.not.be.null;
    const expectedResponses = [
      'organisationlookup-2-0-a-dev',
      'organisationlookup-2-0-b-dev'
    ]
    expect(expectedResponses).to.contain(response.idle);
    expect(expectedResponses).to.contain(response.idle);
  });
});
