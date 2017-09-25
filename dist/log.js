'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _logToFile = require('log-to-file');

var _logToFile2 = _interopRequireDefault(_logToFile);

var _nodeEnvFile = require('node-env-file');

var _nodeEnvFile2 = _interopRequireDefault(_nodeEnvFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nodeEnvFile2.default)(__dirname + '/../.env');

function log(message) {
    if (process.env.NODE_ENV == 'prod') (0, _logToFile2.default)(message, 'data/log.txt');else console.log(message);
}

exports.default = log;