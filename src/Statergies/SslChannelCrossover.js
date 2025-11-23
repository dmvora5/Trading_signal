const { calculateSSLChannel } = require("../Indicators/sslChannel");

class SSLStrategy {
    constructor(config) {
        this.config = config;
    }

    apply(data) {
        const crossovers = calculateSSLChannel(data, this.config.period || 13);
        const enrichedData = data.map((candle, index) => {
            return {
                ...candle,
                crossover: crossovers[index] || null,
                trade: crossovers[index] === 'upward' ? 'buy' : crossovers[index] === 'downward' ? 'sell' : null
            };
        });
        return enrichedData;
    }
}


module.exports = SSLStrategy;