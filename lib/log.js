import logToFile from 'log-to-file';
import env from 'node-env-file';

env(__dirname + '/../.env');

function log(message){
    if(process.env.NODE_ENV == 'prod')
        logToFile(message, 'data/log.txt');
    else
        console.log(message);
}

export default log;
