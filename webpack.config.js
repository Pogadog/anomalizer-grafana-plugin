
const fs = require("fs");
const exec = require('child_process').exec;

module.exports = (config, options) => {

    // correctly include svgs as base64 assets
    config.module.rules.push({
        test: /\.svg/,
        type: 'asset',
    })

    // copy built plugin to shared Grafana Docker plugin directory
    config.plugins.push({
        apply: (compiler) => {
            compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                let buildPath = fs.readFileSync("./grafanaPluginDirectory.txt", 'utf-8');
                exec(`mkdir -p ${buildPath}/pogadog-anomalizer-panel && cp -r dist/ ${buildPath}/pogadog-anomalizer-panel`, (err, stdout, stderr) => {
                    process.stdout.write(`  Plugin successfully copied to ${buildPath}\n`);
                });
            });
        }
      })

    return config;
}
