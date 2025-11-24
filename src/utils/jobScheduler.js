const schedule = require("node-schedule");

function isForexMarketOpen() {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sun, 6 = Sat
    return day !== 6 && day !== 0; // Open Mon–Fri
}

function scheduleJob({ jobFunction }) {
    if (typeof jobFunction !== "function") {
        throw new Error("jobFunction must be a function");
    }

    // 🔥 RUN AT:
    // IST: 03:31, 07:31, 11:31, 15:31, 19:31, 23:31
    // UTC equivalents: 22:01, 02:01, 06:01, 10:01, 14:01, 18:01

    const rule = new schedule.RecurrenceRule();
    rule.tz = "UTC";
    rule.minute = 1; // 1 minute buffer
    rule.hour = [22, 2, 6, 10, 14, 18]; // UTC hours that match IST 03:31 start

    const job = schedule.scheduleJob(rule, () => {
        const now = new Date();

        if (isForexMarketOpen()) {
            console.log("🔥 Job executed at (IST):", now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
            jobFunction();
        } else {
            console.log("⛔ Market closed, skipped:", now.toLocaleString());
        }

        console.log("⏭ Next run (IST):",
            job.nextInvocation().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        );
    });

    console.log("⏭ First run (IST):",
        job.nextInvocation().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );

    return job;
}

module.exports = { scheduleJob };
