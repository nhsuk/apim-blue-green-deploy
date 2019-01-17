const searchHostname = process.env['search-hostname'];

module.exports = function azureSearchUrl(searchUrl) {
  return `https://${searchHostname}/${searchUrl}`;
};
