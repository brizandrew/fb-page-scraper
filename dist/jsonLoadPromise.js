'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function jsonLoadPromise(filepath) {
    return new Promise(function (resolve, reject) {
        _fs2.default.readFile(filepath, 'utf8', function (err, data) {
            if (err) {
                if (err.code == 'ENOENT') {
                    resolve([]);
                } else reject(err);
            } else resolve(JSON.parse(data));
        });
    });
}

exports.default = jsonLoadPromise;