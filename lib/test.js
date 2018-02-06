import db from './db.js';
import log from './log.js';
import saveCSV from './saveCSV.js';


function getFiles(i){
    const limit = 1000;
    const offset = limit * i;

    db.runQuery(`SELECT * FROM posts WHERE scraped_time is not NULL LIMIT ${offset}, ${limit}`)
    .then(data => {
        log(`Saving iteration ${i+1}`);
        saveCSV(data, `posts_${i+1}.csv`);
    })
    .catch((err) => {
        log(err);
    });
}


for (var i = 0; i < 13; i++) {
    getFiles(i);
}
