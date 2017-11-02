'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _csvParser = require('csv-parser');

var _csvParser2 = _interopRequireDefault(_csvParser);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function csvToJson(file) {
    return new Promise(function (resolve, reject) {
        var output = [];
        _fs2.default.createReadStream(file).pipe((0, _csvParser2.default)()).on('data', function (data) {
            output.push(data);
        }).on('end', function () {
            resolve(output);
        }).on('error', function (e) {
            reject(e);
        });
    });
}

exports.default = csvToJson;