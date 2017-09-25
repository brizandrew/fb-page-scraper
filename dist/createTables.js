'use strict';

var _nodeEnvFile = require('node-env-file');

var _nodeEnvFile2 = _interopRequireDefault(_nodeEnvFile);

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nodeEnvFile2.default)(__dirname + '/../.env');
var pagesTable = process.env.DB_TABLE_PREFIX + 'pages';
var postsTable = process.env.DB_TABLE_PREFIX + 'posts';

(0, _log2.default)('Creating database tables...');
_db2.default.runQuery('DROP TABLE IF EXISTS `' + pagesTable + '`;').then(function () {
    _db2.default.runQuery('CREATE TABLE `' + pagesTable + '` (\n      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n      `fb_id` text,\n      `name` text,\n      `ideology` text,\n      PRIMARY KEY (`id`)\n    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;');
}).then(function () {
    _db2.default.runQuery('DROP TABLE IF EXISTS `' + postsTable + '`;');
}).then(function () {
    _db2.default.runQuery('CREATE TABLE `' + postsTable + '` (\n      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n      `fb_id` text,\n      `message` text,\n      `page_id` text,\n      `created_time` int(11) DEFAULT NULL,\n      `scraped_time` int(11) DEFAULT NULL,\n      `type` text,\n      `headline` text,\n      `description` text,\n      `permalink_url` text,\n      `link` text,\n      `shares` int(11) DEFAULT NULL,\n      `comments` int(11) DEFAULT NULL,\n      `likes` int(11) DEFAULT NULL,\n      `love` int(11) DEFAULT NULL,\n      `wow` int(11) DEFAULT NULL,\n      `haha` int(11) DEFAULT NULL,\n      `sad` int(11) DEFAULT NULL,\n      `angry` int(11) DEFAULT NULL,\n      `thankful` int(11) DEFAULT NULL,\n      PRIMARY KEY (`id`)\n    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;');
}).then(function () {
    (0, _log2.default)('Tables created.');
    _db2.default.endConnection();
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});