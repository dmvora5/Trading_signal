const schedule = require("node-schedule");

function isForexMarketOpen() {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sun, 6 = Sat
    return day !== 6 && day !== 0; // Open Mon–Fri
}

function scheduleJob({jobFunction}) {
    if (typeof jobFunction !== "function") {
        throw new Error("jobFunction must be a function");
    }

    // Rule: Run every 4 hours + 1 minute delay (UTC)
    const rule = new schedule.RecurrenceRule();
    rule.tz = "UTC";
    rule.minute = 1;
    rule.hour = new schedule.Range(0, 23, 4);

    // Create job
    const job = schedule.scheduleJob(rule, () => {
        const now = new Date();

        if (isForexMarketOpen()) {
            console.log("🔥 Job executed at:", now.toLocaleString());
            jobFunction();
        } else {
            console.log("⛔ Market closed, job skipped:", now.toLocaleString());
        }

        // Log next run after execution
        console.log("⏭ Next run:", job.nextInvocation().toLocaleString());
    });

    // Log next scheduled time when scheduler starts
    console.log("⏭ First run scheduled at:", job.nextInvocation().toLocaleString());

    return job;
}

module.exports = { scheduleJob };
