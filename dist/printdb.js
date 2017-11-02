'use strict';

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _saveCSV = require('./saveCSV.js');

var _saveCSV2 = _interopRequireDefault(_saveCSV);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_db2.default.getAllData().then(function (data) {
    _db2.default.endConnection();
    (0, _saveCSV2.default)(data, 'output.csv');
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});