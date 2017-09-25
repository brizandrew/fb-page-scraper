import fs from 'fs';
import json2csv from 'json2csv';
import db from './db.js';
import log from './log.js';

db.getAllData()
.then(data => {
    db.endConnection();

    log('Creating a new output file...');

    var fields = Object.keys(data[0]);
    const csvFile = json2csv({
        data: data,
        fields: fields
    });

    fs.writeFile('data/output.csv', csvFile, function(err) {
        if (err)
            log(err);
        else
            log('Output file created successfully.');
    });
})
.catch((err) => {
    log(err);
    db.endConnection();
});
