'use strict';

var _csvToJson = require('./csvToJson.js');

var _csvToJson2 = _interopRequireDefault(_csvToJson);

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _log2.default)('Importing csv...');
(0, _csvToJson2.default)('data/input.csv').then(function (posts) {
    (0, _log2.default)('Adding posts...');

    var addData = posts.map(function (post) {
        return [post.page_id, post.fb_id, post.message, post.created_time];
    });
    var adds = addData.map(_db2.default.addPost);

    return new Promise(function (resolve) {
        return Promise.all(adds).then(function () {
            resolve(posts);
        });
    });
}).then(function (posts) {
    (0, _log2.default)('Updating post data...');
    var deleteFields = ['fb_id', 'page_id', 'message', 'created_time', 'name', 'ideology'];

    var updateData = posts.map(function (post) {
        var data = {};
        Object.assign(data, post);
        data.id = data.fb_id;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = deleteFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _field = _step.value;

                delete data[_field];
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        for (var field in data) {
            if (data[field] == 'null') data[field] = null;
        }

        return data;
    });

    var imports = updateData.map(_db2.default.updatePostData);
    return Promise.all(imports);
}).then(function () {
    (0, _log2.default)('Import complete.');
    _db2.default.endConnection();
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});