/*
* Scrapes the remaining post data for entries in output.csv that don't have them
*/
import log from './log.js';
import cheerio from 'cheerio';
import request from 'request';
import db from './db.js';

async function scrapeLinks(posts){
    for(let post of posts){
        await delay(2000)
        .then(() => {
            log('Making request...');
            return requestPromise(post.link);
        })
        .then((response) => {
            let linkData = {id: post.fb_id};

            var $ = cheerio.load(response.body);

            linkData.headline = escape($('meta[property="og:title"]').attr('content'));
            linkData.description = escape($('meta[property="og:description"]').attr('content'));

            db.updatePostData(linkData);
        });
    }
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

export default scrapeLinks;
