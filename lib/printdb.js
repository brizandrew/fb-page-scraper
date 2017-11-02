import db from './db.js';
import log from './log.js';
import saveCSV from './saveCSV.js';

db.getAllData()
.then(data => {
    db.endConnection();
    saveCSV(data, 'output.csv');
})
.catch((err) => {
    log(err);
    db.endConnection();
});
