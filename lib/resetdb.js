import db from './db.js';
import log from './log.js';

log('Resetting the posts database.');
db.deletePosts()
.then(() => {
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
