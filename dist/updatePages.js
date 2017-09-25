'use strict';

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _jsonLoadPromise = require('./jsonLoadPromise.js');

var _jsonLoadPromise2 = _interopRequireDefault(_jsonLoadPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _log2.default)('Updating pages in database...');
(0, _jsonLoadPromise2.default)('data/pages.json').then(function (obj) {
    return _db2.default.updatePages(obj);
}).then(function () {
    (0, _log2.default)('Update complete.');
    _db2.default.endConnection();
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});