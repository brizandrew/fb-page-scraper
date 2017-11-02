import json2csv from 'json2csv';
import log from './log.js';
import fs from 'fs';

function saveCSV(obj, filename){
    log(`Creating a new output file at data/${filename}...`);

    const fields = Object.keys(obj[0]);
    const data = obj.map(post => {
        const output = {};
        Object.assign(output, post);
        
        output.headline = unescape(output.headline);
        output.description = unescape(output.description);

        return output;
    });

    const csvFile = json2csv({
        data: data,
        fields: fields
    });

    fs.writeFile(`data/${filename}`, csvFile, function(err) {
        if (err)
            log(err);
        else
            log('Output file created successfully.');
    });
}

export default saveCSV;
