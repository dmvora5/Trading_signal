const { default: PAIRS } = require("../../forex_pairs_array");
const { sendSignal } = require("../Bot/telegram");
const SSLStrategy = require("../Statergies/SslChannelCrossover");
const { get4HCandles } = require("./fetchStockData");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hasRecentSignal(data, lookbackPeriod) {
    for (let i = data.length - 1; i >= data.length - lookbackPeriod; i--) {
        if (i < 0) break;
        if (data[i].trade) {
            return data[i];
        }
    }
    return false;
}

async function processStockData(symbol, config) {
    try {
        const stockData = await get4HCandles(symbol);

        if (stockData?.length) {
            const strategy = new SSLStrategy(config || {});
            const enrichedData = strategy.apply(stockData);
            console.log(`Stock: ${symbol}`);

            // Filter for recent buy signals
            const recentSignal = hasRecentSignal(enrichedData,
                config.lookbackPeriod,
            );

            return { symbol, enrichedData, recentSignal };
        } else {
            console.log(`Stock: ${symbol}, Not enough data`);
            return { symbol, enrichedData: [], recentSignal: false };
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return { symbol, enrichedData: [], recentSignal: false };
    }
}

async function fetchAndFilterStocks({ config, stocks }) {
    const fetchPromises = stocks.map(symbol => processStockData(symbol, config));
    const results = await Promise.allSettled(fetchPromises);

    const savePromises = results.map(async result => {
        if (result.status === 'rejected') {
            console.error('Error:', result.reason);
        } else {
            const { enrichedData, symbol, recentSignal } = result.value;
            console.log('symbol', symbol)
            console.table(enrichedData.map(ele => ({ ...ele, date: new Date(ele.date).toLocaleString() })), ['date', 'open', 'high', 'low', 'close', 'crossover', 'trade']);
            if (recentSignal && typeof recentSignal === 'object') {
                console.log('recentSignal', recentSignal)
                console.log(`Stock with recent signal: ${symbol}`);
                await sendSignal(
                    symbol,
                    "4H",
                    recentSignal?.trade
                );
            }
        }
    });

    await Promise.all(savePromises);

    return results;
}

async function startFetchingData() {
    const count = PAIRS.length;          // total number of symbols
    const pageSize = 5; // batch size
    const totalPages = Math.ceil(count / pageSize);

    // Clear old data

    for (let i = 1; i <= totalPages; i++) {
        // Slice the symbols array for pagination
        const start = (i - 1) * pageSize;
        const end = start + pageSize;
        const stocksSymbols = PAIRS.slice(start, end);

        // Fetch and filter in batches
        await fetchAndFilterStocks({
            config: { lookbackPeriod: 3, period: 13 },
            stocks: stocksSymbols
        });

        if (i < totalPages) { // no need to pause after the last batch
            console.log(`Pausing 1 minute before next batch...`);
            await sleep(60000);
        }
    }

}

module.exports = { startFetchingData };