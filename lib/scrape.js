import env from 'node-env-file';
import FB from 'fb';
import moment from 'moment';
import request from 'request';
import events from 'events';
import cheerio from 'cheerio';
import db from './db.js';
import log from './log.js';


/* App Setup */
env(__dirname + '/../.env');
FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);
events.EventEmitter.prototype._maxListeners = 100;

/* Utility Functions */
function gmtToUnix(gmt){
    return moment(gmt, 'YYYY-MM-DD[T]kk:mm:ssZZZZZ').format('X');
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function requestPromise(url){
    return new Promise((resolve, reject) => {
        request(url, function(error, response){
            if(!error)
                resolve(response);
            else
                reject(error);
        });
    });
}

/* Scraping */
function scrapePost(postId){
    return FB.api('', 'post', {
        batch: [
            { method: 'get', relative_url:`/${ postId }?fields=shares,link,permalink_url,type`},
            { method: 'get', relative_url:`/${ postId }/comments?summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=LIKE&summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=LOVE&summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=WOW&summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=HAHA&summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=SAD&summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=ANGRY&summary=total_count`},
            { method: 'get', relative_url:`/${ postId }/reactions?type=THANKFUL&summary=total_count`}
        ]
    })
    .then(res => {
        const metadata = JSON.parse(res[0].body);

        const data = {
            id: metadata.id,
            shares: 'shares' in metadata ? metadata.shares.count : 0,
            link: 'link' in metadata ? `${ metadata.link}` : '',
            permalink_url: 'permalink_url' in metadata ? `${ metadata.permalink_url}` : '',
            type: 'type' in metadata ? `${ metadata.type}` : '',
            comments: JSON.parse(res[1].body).summary.total_count,
            likes: JSON.parse(res[2].body).summary.total_count,
            love: JSON.parse(res[3].body).summary.total_count,
            wow: JSON.parse(res[4].body).summary.total_count,
            haha: JSON.parse(res[5].body).summary.total_count,
            sad: JSON.parse(res[6].body).summary.total_count,
            angry: JSON.parse(res[7].body).summary.total_count,
            thankful: JSON.parse(res[8].body).summary.total_count,
            scraped_time: moment().format('X')
        };
        return new Promise (resolve => {
            resolve(data);
        });
    })
    .then(postData => {
        return db.updatePostData(postData);
    });
}

function scrapeAllPages(){
    return db.getPages()
    .then(pages => {
        // prepare page batch requests
        const batch_requests = [];
        for(let page of pages){
            batch_requests.push({ method: 'get', relative_url:`/${ page.fb_id }/posts?limit=100`});
        }

        // get new posts
        return FB.api('', 'post', {
            batch: batch_requests
        })
        .then(res => {
            let data = [];
            for (let i = 0; i < res.length; i++) {
                const pageInfo = pages[i];
                const posts = JSON.parse(res[i].body).data;

                // convert gmt time to unix time
                posts.forEach(post => {
                    post.created_time = gmtToUnix(post.created_time);
                });

                // filter out old posts
                let filterDate;
                if(pageInfo.last_post === null) { filterDate = moment().subtract(2, 'hours').format('X'); }
                else { filterDate = pageInfo.last_post; }
                const newPosts = posts.filter(post => {
                    return post.created_time > filterDate;
                });

                data.push({
                    pageId: pageInfo.fb_id,
                    posts: newPosts
                });
            }

            // save new posts in database, update last_post
            return db.addPosts(data);
        });
    });
}

function scrapeAllPosts(){
    const age = moment().subtract(SCRAPE_THRESHOLD, 'seconds').format('X');
    return db.getPosts(age)
    .then(posts => {
        const postScrapes = posts.map(scrapePost);
        return Promise.all(postScrapes);
    });
}

function scrapeLink(data, index){
    return delay(index * 3000)
    .then(() => {
        log('Making request...');
        return requestPromise(data.link);
    })
    .then((response) => {
        let linkData = {id: data.fb_id};

        var $ = cheerio.load(response.body);

        linkData.headline = $('meta[property="og:title"]').attr('content');
        linkData.description = $('meta[property="og:description"]').attr('content');

        return db.updatePostData(linkData);
    })
    .catch(err => {
        log(err);
    });
}

function scrapeNewLinks(){
    return db.getNewLinks()
    .then(posts => {
        const linkScrapes = posts.map(scrapeLink);
        return Promise.all(linkScrapes);
    });
}

/* Run Script */
const SCRAPE_THRESHOLD = 3600; // 3600 seconds = 1 hour
log('Starting scrape...');
log('Scraping pages...');
scrapeAllPages()
.then(() => {
    log('Scraping posts...');
    return scrapeAllPosts();
})
.then(() => {
    log('Scraping links...');
    return scrapeNewLinks();
})
.then(() => {
    log('Scrape complete.');
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
