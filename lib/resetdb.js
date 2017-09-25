import db from './db.js';
import log from './log.js';

log('Resetting the posts table.');
db.deletePosts()
.then(() => {
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
