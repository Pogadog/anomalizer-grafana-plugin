
module.exports = (config, options) => {
    config.module.rules.push({
        test: /\.svg/,
        type: 'asset',
    })
    return config;
}
