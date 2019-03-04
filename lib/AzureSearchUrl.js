module.exports = function azureSearchUrl(searchUrl) {
  const searchHostname = process.env['search-hostname'];
  return `https://${searchHostname}/${searchUrl}`;
};
