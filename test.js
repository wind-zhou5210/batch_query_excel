const fs = require('fs');
const { extractReleaseIdsFromLog } = require('./util.js');
const util = require('util');

const truncate = util.promisify(fs.truncate);

async function  test(){

    await Promise.all([
        truncate('retry_demand_empty_release_list.txt', 0),
        truncate('retry_demand_fail_release_list.txt', 0),
        truncate('retry_demand_empty_iteration_list.txt', 0),
        truncate('retry_demand_empty_task_list.txt', 0),
    ]);

    
}

test();

