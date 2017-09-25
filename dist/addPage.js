'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _jsonLoadPromise = require('./jsonLoadPromise.js');

var _jsonLoadPromise2 = _interopRequireDefault(_jsonLoadPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('Adding a new page to your pages.json file...');

// load the pages.json file
(0, _jsonLoadPromise2.default)('data/pages.json')

// prompt the users for an input
.then(function (pages) {
    _prompt2.default.start();
    return new Promise(function (resolve, reject) {
        _prompt2.default.get(['name', 'fb_id', 'ideology'], function (err, result) {
            if (err) reject(err);else resolve([pages, result]);
        });
    });
})

// open and truncate the pages.json file (creating it if it doesn't exist)
.then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        pages = _ref2[0],
        inputs = _ref2[1];

    pages.push(inputs);
    return new Promise(function (resolve, reject) {
        _fs2.default.open('data/pages.json', 'w', function (err, file) {
            if (err) reject(err);else resolve([file, pages, inputs]);
        });
    });
})

// write the new contents into the file
.then(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 3),
        file = _ref4[0],
        pages = _ref4[1],
        inputs = _ref4[2];

    var jsonString = JSON.stringify(pages, null, '\t');
    var jsonBuffer = new Buffer(jsonString);

    return new Promise(function (resolve, reject) {
        _fs2.default.write(file, jsonBuffer, 0, jsonBuffer.length, null, function (err) {
            if (err) reject(err);else {
                resolve(file);
                (0, _log2.default)('The page `' + inputs.name + '` has been added to your pages.json file.');
                (0, _log2.default)('Update the database using the `npm run updatePages` command.');
            }
        });
    });
})

// close the file
.then(function (file) {
    _fs2.default.close(file);
}).catch(function (err) {
    console.log(err);
});