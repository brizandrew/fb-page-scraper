import prompt from 'prompt';
import fs from 'fs';
import log from './log.js';
import jsonLoadPromise from './jsonLoadPromise.js';


console.log('Adding a new page to your pages.json file...');

// load the pages.json file
jsonLoadPromise('data/pages.json')

// prompt the users for an input
.then(pages => {
    prompt.start();
    return new Promise((resolve, reject) => {
        prompt.get(['name', 'fb_id', 'ideology'], (err, result) => {
            if(err)
                reject(err);
            else
                resolve([pages, result]);
        });
    });
})

// open and truncate the pages.json file (creating it if it doesn't exist)
.then(([pages, inputs]) => {
    pages.push(inputs);
    return new Promise((resolve, reject) => {
        fs.open('data/pages.json', 'w', (err, file) => {
            if(err)
                reject(err);
            else
                resolve([file, pages, inputs]);
        });
    });
})

// write the new contents into the file
.then(([file, pages, inputs]) => {
    const jsonString = JSON.stringify(pages, null, '\t');
    const jsonBuffer = Buffer.from(jsonString);

    return new Promise((resolve, reject) => {
        fs.write(file, jsonBuffer, 0, jsonBuffer.length, null, (err) => {
            if(err)
                reject(err);
            else{
                resolve(file);
                log(`The page \`${inputs.name}\` has been added to your pages.json file.`);
                log('Update the database using the `npm run updatePages` command.');
            }
        });
    });
})

// close the file
.then(file => {
    fs.close(file);
})
.catch(err => {
    console.log(err);
});
