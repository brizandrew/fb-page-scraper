'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _json2csv = require('json2csv');

var _json2csv2 = _interopRequireDefault(_json2csv);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveCSV(obj, filename) {
    (0, _log2.default)('Creating a new output file at data/' + filename + '...');

    var fields = Object.keys(obj[0]);
    var data = obj.map(function (post) {
        var output = {};
        Object.assign(output, post);

        output.headline = unescape(output.headline);
        output.description = unescape(output.description);

        return output;
    });

    var csvFile = (0, _json2csv2.default)({
        data: data,
        fields: fields
    });

    _fs2.default.writeFile('data/' + filename, csvFile, function (err) {
        if (err) (0, _log2.default)(err);else (0, _log2.default)('Output file created successfully.');
    });
}

exports.default = saveCSV;