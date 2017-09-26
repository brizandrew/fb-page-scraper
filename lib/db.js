import env from 'node-env-file';
import sql from 'mysql';

/* Env Setup */
env(__dirname + '/../.env');

/* Database Setup */
const conn = sql.createConnection({
    socketPath : process.env.DB_SOCKET,
    user       : process.env.DB_USER,
    password   : process.env.DB_PASSWORD,
    database   : process.env.DB_DATABASE
});
const pagesTable = process.env.DB_TABLE_PREFIX + 'pages';
const postsTable = process.env.DB_TABLE_PREFIX + 'posts';

/* MySQL Shortcuts */
function SELECT(table, columns, extra){
    const table_name = process.env.DB_TABLE_PREFIX + table;
    let output = `SELECT ${ columns.toString() } FROM \`${ table_name }\``;
    if(extra !== undefined)
        output += ` ${extra};`;
    else
        output += ';';

    return output;
}

function INSERT(table, columns){
    const table_name = process.env.DB_TABLE_PREFIX + table;
    const columns_string = columns.join(', ');

    return `INSERT INTO \`${ table_name }\`(${ columns_string }) VALUES(?);`;
}

function UPDATE(table, condition, data){
    const table_name = process.env.DB_TABLE_PREFIX + table;

    const updates = [];
    for (let key in data) {
        updates.push(`${ key } = ?`);
    }

    return `UPDATE \`${ table_name }\` SET ${ updates.toString() } WHERE ${condition}`;
}

/* Database Functions */
function endConnection(){
    conn.end();
}

function deletePages(){
    return new Promise((resolve, reject) => {
        const query = `
            DELETE FROM \`${ pagesTable }\`;`;

        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else
                resolve(results);
        });

    });
}

function addPage(pageData){
    // prepare the query
    const columns = Object.keys(pageData);
    const query = INSERT('pages', columns);

    let values = [];
    for(let value in pageData){
        values.push(pageData[value]);
    }

    // run the query
    return new Promise((resolve, reject) => {
        conn.query(query, [values], function (error) {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}

function addPages(pages){
    return Promise.all(pages.map(addPage));
}

function updatePages(pages){
    return deletePages()
   .then(() => {
       return addPages(pages);
   });
}

function getPages(){
    return new Promise((resolve, reject) => {
        const query =  `
            SELECT \`${ pagesTable }\`.fb_id, name, ideology, last_post
            FROM \`${ pagesTable }\`
            LEFT JOIN (
                SELECT page_id, max(created_time) AS "last_post"
                FROM \`${ postsTable }\`
                GROUP BY page_id
            )
            AS sub
            ON \`${ pagesTable }\`.fb_id = sub.page_id;`;

        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else
                resolve(results);
        });

    });
}

function addPost(values){
    // prepare the query
    const columns = ['page_id','fb_id', 'message', 'created_time'];
    const query = INSERT('posts', columns);

    // run the query
    return new Promise((resolve, reject) => {
        conn.query(query, [values], function (error) {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}

function addPosts(pages){
    let postsToAdd = [];
    for(let page of pages){
        for(let post of page.posts){
            // remove line breaks in posts
            if(post.message !== undefined)
                post.message = post.message.replace(/\r?\n|\r/g,' ');

            postsToAdd.push([page.pageId, post.id, post.message, post.created_time]);
        }
    }

    return Promise.all(postsToAdd.map(addPost));
}

function getPosts(threshold){
    return new Promise((resolve, reject) => {
        const query = SELECT('posts', ['fb_id'], `WHERE created_time < ${threshold} AND scraped_time IS NULL`);
        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else{
                let ids = [];
                for (let post of results) {
                    ids.push(post.fb_id);
                }
                resolve(ids);
            }
        });
    });
}

function updatePostData(data){
    const post_id = data.id;
    delete data.id;
    const query = UPDATE('posts', `fb_id = "${post_id}"`, data);

    const values = [];
    for(let value in data){
        values.push(data[value]);
    }

    return new Promise((resolve, reject) => {
        conn.query(query, values, function (error) {
            if (error){
                reject(error);
            }

            else
                resolve();
        });
    });
}

function getNewLinks(){
    return new Promise((resolve, reject) => {
        const query = SELECT('posts', ['fb_id', 'link'], 'WHERE type = \'link\' AND headline is NULL LIMIT 20');
        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else{
                let data = [];
                for (let post of results) {
                    data.push({
                        fb_id: post.fb_id,
                        link: post.link
                    });
                }
                resolve(data);
            }
        });
    });
}

function getAllData(){
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM \`${ pagesTable }\`
            JOIN \`${ postsTable }\`
            ON \`${ pagesTable }\`.fb_id = \`${ postsTable }\`.page_id
            WHERE scraped_time IS NOT NULL;`;

        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else
                resolve(results);
        });

    });
}

function deletePosts(){
    return new Promise((resolve, reject) => {
        const query = `
            DELETE FROM \`${ postsTable }\;`;

        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else
                resolve(results);
        });

    });
}

function runQuery(query){
    return new Promise((resolve, reject) => {
        conn.query(query, function (error, results) {
            if (error)
                reject(error);
            else
                resolve(results);
        });
    });
}


export default {
    endConnection,
    updatePages,
    getPages,
    addPosts,
    getPosts,
    updatePostData,
    getNewLinks,
    getAllData,
    deletePosts,
    runQuery
};
