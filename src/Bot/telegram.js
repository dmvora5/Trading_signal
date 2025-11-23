require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
    polling: false
});

const UP_TEMPLATE =
    `╔════════════════════╗
   🟢 *CROSS UP* 📈
╚════════════════════╝`;

const DOWN_TEMPLATE =
    `╔════════════════════╗
   🔴 *CROSS DOWN* 📉
╚════════════════════╝`;

function buildMessage(pair, timeframe, direction) {
    const box = direction === "buy" ? UP_TEMPLATE : DOWN_TEMPLATE;
    const now = new Date().toLocaleString("en-US", {
        weekday: "long",    // Monday, Tuesday...
        year: "numeric",    // 2025
        month: "long",      // January, February...
        day: "numeric",     // 1, 2, 3...
        hour: "2-digit",    // 01, 02, 23
        minute: "2-digit",  // 00–59
        second: "2-digit",  // 00–59
        hour12: true        // AM/PM format
    })

    return (
        `📊 *${pair} Signal Alert*

⏱ Timeframe: *${timeframe}*

⏱ Time: *${now}*

${box} `
    );
}

async function sendSignal(pair, timeframe, direction) {
    const msg = buildMessage(pair, timeframe, direction);
    console.log('process.env.CHAT_ID', process.env.CHAT_ID)
    return await bot.sendMessage(process.env.CHAT_ID, msg, {
        parse_mode: "Markdown",
    });
}

module.exports = { sendSignal };
