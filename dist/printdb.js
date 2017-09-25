'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _json2csv = require('json2csv');

var _json2csv2 = _interopRequireDefault(_json2csv);

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_db2.default.getAllData().then(function (data) {
    _db2.default.endConnection();

    (0, _log2.default)('Creating a new output file...');

    var fields = Object.keys(data[0]);
    var csvFile = (0, _json2csv2.default)({
        data: data,
        fields: fields
    });

    _fs2.default.writeFile('data/output.csv', csvFile, function (err) {
        if (err) (0, _log2.default)(err);else (0, _log2.default)('Output file created successfully.');
    });
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});