import env from 'node-env-file';
import db from './db.js';
import log from './log.js';

env(__dirname + '/../.env');
const pagesTable = process.env.DB_TABLE_PREFIX + 'pages';
const postsTable = process.env.DB_TABLE_PREFIX + 'posts';

log('Creating database tables...');
db.runQuery(`DROP TABLE IF EXISTS \`${pagesTable}\`;`)
.then(() => {
    db.runQuery(`CREATE TABLE \`${pagesTable}\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`fb_id\` text,
      \`name\` text,
      \`ideology\` text,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`);
})
.then(() => {
    db.runQuery(`DROP TABLE IF EXISTS \`${postsTable}\`;`);
})
.then(() => {
    db.runQuery(`CREATE TABLE \`${postsTable}\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`fb_id\` text,
      \`message\` text,
      \`page_id\` text,
      \`created_time\` int(11) DEFAULT NULL,
      \`scraped_time\` int(11) DEFAULT NULL,
      \`type\` text,
      \`headline\` text,
      \`description\` text,
      \`permalink_url\` text,
      \`link\` text,
      \`shares\` int(11) DEFAULT NULL,
      \`comments\` int(11) DEFAULT NULL,
      \`likes\` int(11) DEFAULT NULL,
      \`love\` int(11) DEFAULT NULL,
      \`wow\` int(11) DEFAULT NULL,
      \`haha\` int(11) DEFAULT NULL,
      \`sad\` int(11) DEFAULT NULL,
      \`angry\` int(11) DEFAULT NULL,
      \`thankful\` int(11) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`);
})
.then(() => {
    log('Tables created.');
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
