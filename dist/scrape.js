'use strict';

var _nodeEnvFile = require('node-env-file');

var _nodeEnvFile2 = _interopRequireDefault(_nodeEnvFile);

var _fb = require('fb');

var _fb2 = _interopRequireDefault(_fb);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _db = require('./db.js');

var _db2 = _interopRequireDefault(_db);

var _log = require('./log.js');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* App Setup */
(0, _nodeEnvFile2.default)(__dirname + '/../.env');
_fb2.default.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);
_events2.default.EventEmitter.prototype._maxListeners = 100;

/* Utility Functions */
function gmtToUnix(gmt) {
    return (0, _moment2.default)(gmt, 'YYYY-MM-DD[T]kk:mm:ssZZZZZ').format('X');
}

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

/* Scraping */
function scrapePost(postId) {
    return _fb2.default.api('', 'post', {
        batch: [{ method: 'get', relative_url: '/' + postId + '?fields=shares,link,permalink_url,type' }, { method: 'get', relative_url: '/' + postId + '/comments?summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=LIKE&summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=LOVE&summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=WOW&summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=HAHA&summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=SAD&summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=ANGRY&summary=total_count' }, { method: 'get', relative_url: '/' + postId + '/reactions?type=THANKFUL&summary=total_count' }]
    }).then(function (res) {
        // getting post metadata
        var metadata = JSON.parse(res[0].body);
        var data = {
            id: metadata.id,
            shares: 'shares' in metadata ? metadata.shares.count : 0,
            link: 'link' in metadata ? '' + metadata.link : '',
            permalink_url: 'permalink_url' in metadata ? '' + metadata.permalink_url : '',
            type: 'type' in metadata ? '' + metadata.type : '',
            scraped_time: (0, _moment2.default)().format('X')
        };

        // getting post reactions and shares
        var categories = ['comments', 'likes', 'love', 'wow', 'haha', 'sad', 'angry', 'thankful'];
        for (var i = 0; i < categories.length; i++) {
            var respObj = JSON.parse(res[i + 1].body).summary;
            var catCount = respObj !== undefined ? respObj.total_count : null;
            data[categories[i]] = catCount;
        }

        return new Promise(function (resolve) {
            resolve(data);
        });
    }).then(function (postData) {
        return _db2.default.updatePostData(postData);
    });
}

function scrapeAllPages() {
    return _db2.default.getPages().then(function (pages) {
        // prepare page batch requests
        var batch_requests = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = pages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var page = _step.value;

                batch_requests.push({ method: 'get', relative_url: '/' + page.fb_id + '/posts?limit=100' });
            }

            // get new posts
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

        return _fb2.default.api('', 'post', {
            batch: batch_requests
        }).then(function (res) {
            var data = [];

            var _loop = function _loop(i) {
                var pageInfo = pages[i];
                var posts = JSON.parse(res[i].body).data;

                // convert gmt time to unix time
                posts.forEach(function (post) {
                    post.created_time = gmtToUnix(post.created_time);
                });

                // filter out old posts
                // if this is the first post, filter posts that are older than the threshold + 1hr
                // if this isn't the first post, filter posts that are older than the last post
                var filterDate = void 0;
                if (pageInfo.last_post === null) filterDate = (0, _moment2.default)().subtract(SCRAPE_THRESHOLD + 3600, 'seconds').format('X');else filterDate = pageInfo.last_post;
                var newPosts = posts.filter(function (post) {
                    return post.created_time > filterDate;
                });

                data.push({
                    pageId: pageInfo.fb_id,
                    posts: newPosts
                });
            };

            for (var i = 0; i < res.length; i++) {
                _loop(i);
            }

            // save new posts in database, update last_post
            return _db2.default.addPosts(data);
        });
    });
}

function scrapeAllPosts() {
    var age = (0, _moment2.default)().subtract(SCRAPE_THRESHOLD, 'seconds').format('X');
    return _db2.default.getPosts(age).then(function (posts) {
        var postScrapes = posts.map(scrapePost);
        return Promise.all(postScrapes);
    });
}

function scrapeLink(data, index) {
    return delay(index * 3000).then(function () {
        (0, _log2.default)('Making request...');
        return requestPromise(data.link);
    }).then(function (response) {
        var linkData = { id: data.fb_id };

        var $ = _cheerio2.default.load(response.body);

        linkData.headline = escape($('meta[property="og:title"]').attr('content'));
        linkData.description = escape($('meta[property="og:description"]').attr('content'));

        return _db2.default.updatePostData(linkData);
    }).catch(function (err) {
        (0, _log2.default)(err);
    });
}

function scrapeNewLinks() {
    return _db2.default.getNewLinks().then(function (posts) {
        var linkScrapes = posts.map(scrapeLink);
        return Promise.all(linkScrapes);
    });
}

/* Run Script */
var SCRAPE_THRESHOLD = 86400; // 3600 seconds = 1 hour
(0, _log2.default)('Starting scrape...');
(0, _log2.default)('Scraping pages...');
scrapeAllPages().then(function () {
    (0, _log2.default)('Scraping posts...');
    return scrapeAllPosts();
}).then(function () {
    (0, _log2.default)('Scraping links...');
    return scrapeNewLinks();
}).then(function () {
    (0, _log2.default)('Scrape complete.');
    _db2.default.endConnection();
}).catch(function (err) {
    (0, _log2.default)(err);
    _db2.default.endConnection();
});