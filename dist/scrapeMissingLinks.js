'use strict';

require('babel-polyfill');

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _scrapeLinks = require('./scrapeLinks.js');

var _scrapeLinks2 = _interopRequireDefault(_scrapeLinks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scrapeNewLinks() {
    return _db2.default.getNewLinks().then(function (posts) {
        console.log(posts.length);
        return (0, _scrapeLinks2.default)(posts);
    });
}

/* Run Script */
(0, _log2.default)('Scraping missing links...');
scrapeNewLinks().then(function () {
    (0, _log2.default)('Scrape complete.');
    _db2.default.endConnection();
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});