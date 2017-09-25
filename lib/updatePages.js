import fs from 'fs';
import db from './db.js';
import log from './log.js';

function jsonLoadPromise(){
    return new Promise((resolve, reject) => {
        fs.readFile('data/pages.json', 'utf8', function (err, data) {
            if (err) throw reject(err);
            resolve(JSON.parse(data));
        });
    });
}


log('Updating pages in database...');
jsonLoadPromise()
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
