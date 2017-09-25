import db from './db.js';
import log from './log.js';
import jsonLoadPromise from './jsonLoadPromise.js';


log('Updating pages in database...');
jsonLoadPromise('data/pages.json')
.then(obj => {
    return db.updatePages(obj);
})
.then(() => {
    log('Update complete.');
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
