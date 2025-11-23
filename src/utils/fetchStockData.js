
require("dotenv").config();

    const TwelveData = require("twelvedata");

    const client = TwelveData({
        key: process.env.TWELVDATA_API_KEY,
    });


async function get4HCandles(symbol) {
    try {

        const params = {
            symbol: symbol,
            interval: "4h",
            outputsize: 60,
            order: "ASC",
        };

        const result = await client.timeSeries(params);

        if (result && result.values) {
            const candles = result.values.map(quote => ({
                symbol,
                date: new Date(quote.datetime),
                open: Number(quote.open),
                high: Number(quote.high),
                low: Number(quote.low),
                close: Number(quote.close)
            }));
            // await StockData.insertMany(candles);
            // return candles.slice(-periods);
            return candles;
        }
        console.log(`No data fetched for ${symbol}`);
        return [];


    } catch (err) {
        console.error("Request Failed:", err);
    }
}


module.exports = { get4HCandles };