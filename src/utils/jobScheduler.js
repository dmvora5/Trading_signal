const schedule = require('node-schedule');

/**
 * Schedules a job to run at a specified initial time and then at a recurring interval.
 * @param {Object} options - The options for scheduling the job.
 * @param {number} options.initialHour - The hour (0-23) for the initial job run. Default is 9.
 * @param {number} options.initialMinute - The minute (0-59) for the initial job run. Default is 16.
 * @param {number} options.intervalMinutes - The interval in minutes for recurring job runs. Default is 5.
 * @param {function} options.jobFunction - The function to be executed for the job.
 */

function isForexMarketOpen() {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sun, 6 = Sat
    const hour = now.getUTCHours();
    const minutes = now.getUTCMinutes();

    // Forex closes: Saturday 00:00 UTC → Monday 00:00 UTC
    if (day === 6) return false; // Saturday
    if (day === 0) return false; // Sunday

    return true; // Monday–Friday (24h open)
}


function isInDailyBreak() {

    const nowUtc = new Date();
    // example break window: 02:00 UTC to 02:15 UTC
    const breakStartHour = 2, breakStartMin = 0;
    const breakEndHour = 2, breakEndMin = 15;

    const start = new Date(nowUtc);
    start.setUTCHours(breakStartHour, breakStartMin, 0, 0);
    const end = new Date(nowUtc);
    end.setUTCHours(breakEndHour, breakEndMin, 0, 0);

    return nowUtc >= start && nowUtc < end;
}

function scheduleJob({
    initialHour = 2,
    initialMinute = 31,
    intervalMinutes = 240,
    jobFunction
} = {}) {
    if (typeof jobFunction !== 'function') {
        throw new Error('jobFunction must be a function');
    }

    // Store the next run time
    let nextRunTime = calculateNextRunTime();

    // Calculate the next run time based on the initial time
    function calculateNextRunTime() {
        const now = new Date();
        const initialTimeToday = new Date();
        initialTimeToday.setHours(initialHour, initialMinute, 0, 0);

        if (now < initialTimeToday) {
            return initialTimeToday;
        }

        const minutesSinceInitial = Math.floor((now - initialTimeToday) / 60000);
        const minutesToNextInterval = intervalMinutes - (minutesSinceInitial % intervalMinutes);
        const nextRun = new Date(now.getTime() + minutesToNextInterval * 60000);
        nextRun.setSeconds(30, 0);

        return nextRun;
    }

    // Schedule the next job
    function scheduleNextJob() {
        console.log('Next job scheduled at:', nextRunTime.toLocaleString());

        schedule.scheduleJob(nextRunTime, function () {
            if (isForexMarketOpen() && !isInDailyBreak()) {
                console.log('Job is running at:', new Date().toLocaleString());
                jobFunction();
            } else {
                console.log("⛔ Market closed — skipping job");
            }

            // Calculate and store the next run time
            nextRunTime = new Date(nextRunTime.getTime() + intervalMinutes * 60000);
            scheduleNextJob();
        });
    }

    // Start the initial job scheduling
    scheduleNextJob();
}

module.exports = { scheduleJob };
