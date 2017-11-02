import csvParser from 'csv-parser';
import fs from 'fs';

function csvToJson(file){
    return new Promise((resolve, reject) => {
        const output = [];
        fs.createReadStream(file)
          .pipe(csvParser())
          .on('data', (data) => {
              output.push(data);
          })
          .on('end', () => {
              resolve(output);
          })
          .on('error', (e) => {
              reject(e);
          });
    });
}

export default csvToJson;
