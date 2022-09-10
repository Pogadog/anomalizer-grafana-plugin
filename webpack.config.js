const path = require("path");
const fs = require("fs");
const exec = require('child_process').exec;

module.exports = (config, options) => {
    config.module.rules.push({
        test: /\.svg/,
        type: 'asset',
    })

    config.plugins.push({
        apply: (compiler) => {
            compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                let buildPath = fs.readFileSync("./grafanaPluginDirectory.txt", 'utf-8');
                exec(`cp -r dist/ ${buildPath}/pogadog-anomalizer-panel`, (err, stdout, stderr) => {
                    process.stdout.write(`  Plugin successfully copied to ${buildPath}\n`);
                });
            });
        }
      })

    return config;
}
