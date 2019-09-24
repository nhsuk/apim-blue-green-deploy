const chai = require('chai');
const validateSearchApiVersion = require('../../../lib/ValidateSearchApiVersion');

const expect = chai.expect;

describe('SearchApiVersionUtils', () => {
  describe('ValidateSearchApiVersion', () => {
    it('should handle valid versions', () => {
      expect(validateSearchApiVersion('2019-05-06')).to.equal('2019-05-06');
      expect(validateSearchApiVersion('2017-11-11')).to.equal('2017-11-11');
      expect(validateSearchApiVersion('2017-11-11-Preview')).to.equal('2017-11-11-Preview');
    });
    it('should handle default versions', () => {
      expect(validateSearchApiVersion()).to.equal('2017-11-11');
    });
    it('should handle invalid versions', () => {
      expect(() => { validateSearchApiVersion('invalid version'); }).to.throw('The API version \'invalid version\' can not be handled.');
    });
  });
});
