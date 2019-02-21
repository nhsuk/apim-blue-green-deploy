const chai = require('chai');
const parseServiceUrl = require('../../../lib/parseServiceUrl');

const expect = chai.expect;

describe('parseServiceUrl', () => {
  describe('valid urls', () => {
    it('it should handle active index \'a\'', () => {
      const indexDetals = parseServiceUrl('https://hostname/indexes/organisationlookup-2-0-a-dev/docs/');
      expect(indexDetals.active).to.be.equal('organisationlookup-2-0-a-dev');
      expect(indexDetals.idle).to.be.equal('organisationlookup-2-0-b-dev');
    });

    it('it should handle active index \'b\'', () => {
      const indexDetals = parseServiceUrl('https://hostname/indexes/organisationlookup-2-0-b-dev/docs/');
      expect(indexDetals.active).to.be.equal('organisationlookup-2-0-b-dev');
      expect(indexDetals.idle).to.be.equal('organisationlookup-2-0-a-dev');
    });
  });

  describe('invalid urls', () => {
    it('it should throw when not able to parse url', () => {
      const serviceUrl = 'https://hostname/blah';
      expect(() => { parseServiceUrl(serviceUrl); }).to.throw(`The URL (${serviceUrl}) is not in a recognised format.`);
    });

    it('it should throw when not able to parse index name', () => {
      const indexName = 'somethingsomething-dev';
      const serviceUrl = `https://hostname/indexes/${indexName}/docs/`;
      expect(() => { parseServiceUrl(serviceUrl); }).to.throw(`The index name (${indexName}) is not in a recognised format.`);
    });
  });
});
