const path = require("path");
const fs = require("fs");

module.exports = (config, options) => {
    config.module.rules.push({
        test: /\.svg/,
        type: 'asset',
    })
    let buildPath = fs.readFileSync("./buildPath.txt", 'utf-8');
    config.output.path = path.resolve(buildPath + '/anomalizer-grafana-plugin');
    return config;
}
