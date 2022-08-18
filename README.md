# Anomalizer Grafana Plugin by Pogadog

This is the Grafana plugin for the Anomalizer, which provides Prometheus anomaly visualization. It's based upon the [original React-Native UI](https://github.com/pogadog/anomalizer-ui), written in React Typescript with the Grafana plugin infastructure.

> With its grid-based design and similar metrics feature, the Anomalizer UI aims to create the perfect balance of computer intelligence and the human eye to help find anomalies within your system.

> With split-pane views, actionable features, and quick filter mechanisms, the Anomalizer UI helps you find metrics that are important, faster.

> The Anomalizer UI follows the Airbus [*dark cockpit*](https://www.icao.int/ESAF/Documents/meetings/2017/AFI%20FOSAS%202017/Day%201%20Docs/Day_1_2_Airbuspihlo.pdf) aircraft design philosophy with its presentation of metrics by visually highlighting metrics you need to know about on its main page, allowing you to identify anomalies in your system within a fraction of a second.

This plugin is in active development. It's constantly being improved upon, gradually implementing features from the original UI.

# Co-dependents

This project is not standalone; it requires the Anomalizer server, which can be boostrapped through its Github project [here](https://github.com/pogadog/anomalizer), or accessed in a production environment [here](https://anomalizer.app) on the web.

The Anomalizer server `docker-compose` method contains a Docker image of this project, so you shouldn't need to install this project separately to run it. However, development instructions are below.

# Development

### Libraries Needed
- Node : >=16
- Npm : latest (should come with Node)
- Docker

### Install the project
- Clone
- `cd anomalizer-grafana-plugin`
- `npm install`
- `npm start`

### Start Docker
- `docker run -d -p 3000:3000 -v "$(pwd)"/dist:/var/lib/grafana/plugins --name=grafana grafana/grafana:7.0.0`
- This will start a Grafana instance locally, along with mapping the build directory of the plugin to the Grafana plugin resource folder

### Build a panel
- The Grafana UI should be running on `localhost:3000`
- Go to [`http://localhost:3000/dashboards/new`](`http://localhost:3000/dashboards/new`) (or use an existing Dashboard)
- Click `Add new panel`
- Under the `Visualization` dropdown in the right-hand column, click `Anomalizer`
- Click `Apply` (or `Save` to persist your changes)

### You should now have a working panel of the Anomalizer plugin!
> The plugin automatically connects to `https://engine.anomalizer.app`, the on-demand Anomalizer demo backend in the cloud. It may take a few minutes for the metrics to show up. This is a shared instance, so cloud metric filters may be inconsistent.
