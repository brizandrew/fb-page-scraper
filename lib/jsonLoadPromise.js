import fs from 'fs';
function jsonLoadPromise(filepath){
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', function (err, data) {
            if (err){
                if(err.code == 'ENOENT'){
                    resolve([]);
                }

                else
                    reject(err);
            }
            else
                resolve(JSON.parse(data));
        });
    });
}

export default jsonLoadPromise;
