'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodeEnvFile = require('node-env-file');

var _nodeEnvFile2 = _interopRequireDefault(_nodeEnvFile);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Env Setup */
(0, _nodeEnvFile2.default)(__dirname + '/../.env');

/* Database Setup */
var conn = _mysql2.default.createConnection({
    socketPath: process.env.DB_SOCKET,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
var pagesTable = process.env.DB_TABLE_PREFIX + 'pages';
var postsTable = process.env.DB_TABLE_PREFIX + 'posts';

/* MySQL Shortcuts */
function SELECT(table, columns, extra) {
    var table_name = process.env.DB_TABLE_PREFIX + table;
    var output = 'SELECT ' + columns.toString() + ' FROM `' + table_name + '`';
    if (extra !== undefined) output += ' ' + extra + ';';else output += ';';

    return output;
}

function INSERT(table, columns) {
    var table_name = process.env.DB_TABLE_PREFIX + table;
    var columns_string = columns.join(', ');

    return 'INSERT INTO `' + table_name + '`(' + columns_string + ') VALUES(?);';
}

function UPDATE(table, condition, data) {
    var table_name = process.env.DB_TABLE_PREFIX + table;

    var updates = [];
    for (var key in data) {
        updates.push(key + ' = ?');
    }

    return 'UPDATE `' + table_name + '` SET ' + updates.toString() + ' WHERE ' + condition;
}

/* Database Functions */
function endConnection() {
    conn.end();
}

function deletePages() {
    return new Promise(function (resolve, reject) {
        var query = '\n            DELETE FROM `' + pagesTable + '`;';

        conn.query(query, function (error, results) {
            if (error) reject(error);else resolve(results);
        });
    });
}

function addPage(pageData) {
    // prepare the query
    var columns = Object.keys(pageData);
    var query = INSERT('pages', columns);

    var values = [];
    for (var value in pageData) {
        values.push(pageData[value]);
    }

    // run the query
    return new Promise(function (resolve) {
        conn.query(query, [values], function (error) {
            if (error) (0, _log2.default)(error);

            resolve();
        });
    });
}

function addPages(pages) {
    return Promise.all(pages.map(addPage));
}

function updatePages(pages) {
    return deletePages().then(function () {
        return addPages(pages);
    });
}

function getPages() {
    return new Promise(function (resolve, reject) {
        var query = '\n            SELECT `' + pagesTable + '`.fb_id, name, ideology, last_post\n            FROM `' + pagesTable + '`\n            LEFT JOIN (\n                SELECT page_id, max(created_time) AS "last_post"\n                FROM `' + postsTable + '`\n                GROUP BY page_id\n            )\n            AS sub\n            ON `' + pagesTable + '`.fb_id = sub.page_id;';

        conn.query(query, function (error, results) {
            if (error) reject(error);else resolve(results);
        });
    });
}

function addPost(values) {
    // prepare the query
    var columns = ['page_id', 'fb_id', 'message', 'created_time'];
    var query = INSERT('posts', columns);

    // run the query
    return new Promise(function (resolve) {
        conn.query(query, [values], function (error) {
            if (error) (0, _log2.default)(error);

            resolve();
        });
    });
}

function addPosts(pages) {
    var postsToAdd = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = pages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var page = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = page.posts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var post = _step2.value;

                    // remove line breaks in posts
                    if (post.message !== undefined) post.message = post.message.replace(/\r?\n|\r/g, ' ');

                    postsToAdd.push([page.pageId, post.id, post.message, post.created_time]);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
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

    return Promise.all(postsToAdd.map(addPost));
}

function getPosts(threshold) {
    return new Promise(function (resolve, reject) {
        var query = SELECT('posts', ['fb_id'], 'WHERE created_time < ' + threshold + ' AND scraped_time IS NULL');
        conn.query(query, function (error, results) {
            if (error) reject(error);else {
                var ids = [];
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = results[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var post = _step3.value;

                        ids.push(post.fb_id);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                resolve(ids);
            }
        });
    });
}

function updatePostData(data) {
    var post_id = data.id;
    delete data.id;
    var query = UPDATE('posts', 'fb_id = "' + post_id + '"', data);

    var values = [];
    for (var value in data) {
        values.push(data[value]);
    }

    return new Promise(function (resolve) {
        conn.query(query, values, function (error) {
            if (error) (0, _log2.default)(error);

            resolve();
        });
    });
}

function getNewLinks() {
    return new Promise(function (resolve, reject) {
        var query = SELECT('posts', ['fb_id', 'link'], 'WHERE type = \'link\' AND headline is NULL');
        conn.query(query, function (error, results) {
            if (error) reject(error);else {
                var data = [];
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = results[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var post = _step4.value;

                        data.push({
                            fb_id: post.fb_id,
                            link: post.link
                        });
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                resolve(data);
            }
        });
    });
}

function getAllData() {
    return new Promise(function (resolve, reject) {
        var query = '\n            SELECT * FROM `' + pagesTable + '`\n            JOIN `' + postsTable + '`\n            ON `' + pagesTable + '`.fb_id = `' + postsTable + '`.page_id\n            WHERE scraped_time IS NOT NULL;';

        conn.query(query, function (error, results) {
            if (error) reject(error);else resolve(results);
        });
    });
}

function deletePosts() {
    return new Promise(function (resolve, reject) {
        var query = '\n            DELETE FROM `' + postsTable + '`;';

        conn.query(query, function (error, results) {
            if (error) reject(error);else resolve(results);
        });
    });
}

function runQuery(query) {
    return new Promise(function (resolve, reject) {
        conn.query(query, function (error, results) {
            if (error) reject(error);else resolve(results);
        });
    });
}

exports.default = {
    endConnection: endConnection,
    updatePages: updatePages,
    getPages: getPages,
    addPost: addPost,
    addPosts: addPosts,
    getPosts: getPosts,
    updatePostData: updatePostData,
    getNewLinks: getNewLinks,
    getAllData: getAllData,
    deletePosts: deletePosts,
    runQuery: runQuery
};