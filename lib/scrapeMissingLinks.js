import 'babel-polyfill';
import log from './log.js';
import db from './db.js';
import scrapeLinks from './scrapeLinks.js';


function scrapeNewLinks(){
    return db.getNewLinks()
    .then(posts => {
        return scrapeLinks(posts);
    });
}

/* Run Script */
log('Scraping missing links...');
scrapeNewLinks()
.then(() => {
    log('Scrape complete.');
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
