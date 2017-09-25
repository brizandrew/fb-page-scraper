'use strict';

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _log2.default)('Resetting the posts table.');
_db2.default.deletePosts().then(function () {
    _db2.default.endConnection();
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});