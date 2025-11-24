const { scheduleJob } = require("./src/utils/jobScheduler");


scheduleJob({
    jobFunction: () => {
        console.log("Job executed at:", new Date().toISOString());
    }
})