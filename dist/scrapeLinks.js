'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var scrapeLinks = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(posts) {
        var _this = this;

        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

        return regeneratorRuntime.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context2.prev = 3;
                        _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                            var post;
                            return regeneratorRuntime.wrap(function _loop$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            post = _step.value;
                                            _context.next = 3;
                                            return delay(2000).then(function () {
                                                (0, _log2.default)('Making request...');
                                                return requestPromise(post.link);
                                            }).then(function (response) {
                                                var linkData = { id: post.fb_id };

                                                var $ = _cheerio2.default.load(response.body);

                                                linkData.headline = escape($('meta[property="og:title"]').attr('content'));
                                                linkData.description = escape($('meta[property="og:description"]').attr('content'));

                                                _db2.default.updatePostData(linkData);
                                            });

                                        case 3:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _loop, _this);
                        });
                        _iterator = posts[Symbol.iterator]();

                    case 6:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context2.next = 11;
                            break;
                        }

                        return _context2.delegateYield(_loop(), 't0', 8);

                    case 8:
                        _iteratorNormalCompletion = true;
                        _context2.next = 6;
                        break;

                    case 11:
                        _context2.next = 17;
                        break;

                    case 13:
                        _context2.prev = 13;
                        _context2.t1 = _context2['catch'](3);
                        _didIteratorError = true;
                        _iteratorError = _context2.t1;

                    case 17:
                        _context2.prev = 17;
                        _context2.prev = 18;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 20:
                        _context2.prev = 20;

                        if (!_didIteratorError) {
                            _context2.next = 23;
                            break;
                        }

                        throw _iteratorError;

                    case 23:
                        return _context2.finish(20);

                    case 24:
                        return _context2.finish(17);

                    case 25:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this, [[3, 13, 17, 25], [18,, 20, 24]]);
    }));

    return function scrapeLinks(_x) {
        return _ref.apply(this, arguments);
    };
}();

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Scrapes the remaining post data for entries in output.csv that don't have them
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */


function delay(ms) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
    });
}

function requestPromise(url) {
    return new Promise(function (resolve, reject) {
        (0, _request2.default)(url, function (error, response) {
            if (!error) resolve(response);else reject(error);
        });
    });
}

exports.default = scrapeLinks;