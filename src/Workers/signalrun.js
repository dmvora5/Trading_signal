const { startFetchingData } = require("../utils/stockFilter");

const { scheduleJob } = require("../utils/jobScheduler");


    (() => {
        scheduleJob({
            jobFunction: startFetchingData
        });
        console.log("scheduler set")
    })();