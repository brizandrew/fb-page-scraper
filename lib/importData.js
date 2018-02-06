import csvToJson from './csvToJson.js';
import db from './db.js';
import log from './log.js';


log('Importing csv...');
csvToJson('data/input.csv')
.then(posts => {
    log('Adding posts...');

    const addData = posts.map(post => {
        return [
            post.page_id,
            post.fb_id,
            post.message,
            post.created_time,
        ];
    });
    const adds = addData.map(db.addPost);

    return new Promise(function(resolve) {
        return Promise.all(adds)
        .then(() => {
            resolve(posts);
        });
    });
})
.then(posts => {
    log('Updating post data...');
    const deleteFields = [
        'fb_id',
        'page_id',
        'message',
        'created_time',
        'name',
        'ideology',
    ];

    const updateData = posts.map(post => {
        const data = {};
        Object.assign(data, post);
        data.id = data.fb_id;

        for (let field of deleteFields) {
            delete data[field];
        }

        for(let field in data){
            if(data[field] == 'null')
                data[field] = null;
        }

        return data;
    });

    const imports = updateData.map(db.updatePostData);
    return Promise.all(imports);
})
.then(() => {
    log('Import complete.');
    db.endConnection();
})
.catch((err) => {
    log(err);
    db.endConnection();
});
