import React, { Component } from 'react';
import { PanelProps } from '@grafana/data';
import OptionsTypes from 'types/Options';
import * as GrafanaUI from '@grafana/ui';
import update from 'immutability-helper';
import Clock from './Clock';
import Theme from 'values/Theme';
import MetricGridSquare from './MetricGridSquare';
import MetricFigure from 'types/MetricFigure';
import MetricImage from 'types/MetricImage';

import '../styles/root.css';
import MetricModal from './MetricModal';
import Reshade from './Reshade';
import Fetch from './Fetch';

type MetricFigureLayout = MetricFigure["layout"];

const logo = require("../img/logo.svg");
interface Filters {
    primary: {
        UI: {
            filter: string,
            invert: 'match' | 'notMatch'
        },
        server: {
            filter: string,
            invert: 'match' | 'notMatch'
        }
        
    },
    secondary: {
        UI: {
            filter: string,
            invert: 'match' | 'notMatch'
        },
        server: {
            filter: string,
            invert: 'match' | 'notMatch'
        }
    }
}

interface Props extends PanelProps<OptionsTypes> {};
interface State {
    showModal: boolean,
    ready: boolean,
    images: {
        [key: string]: MetricImage
    },
    renderedImages: MetricImage[]
    activeMetric: string,
    showMetric: string | null,
    showMetricImage: MetricImage | null
    showMetricFigure: MetricFigure | null,
    loadingBarPinAlternate: boolean,
    logoPopAnimation: "stop" | "start",
    filters: Filters,
    metricsRefreshKey: number,
    showLoading: boolean,
    datasourceDisconnect: boolean
}
export default class Main extends Component<Props, State> {

    clock: Clock
    clockKeys: {
        [key: string]: string
    }

    refreshInterval: () => number;

    reshade: Reshade;

    processIncomingFiltersTimeout: NodeJS.Timer | undefined

    constructor(props: Props) {
        super(props);
        this.state = {
            metricsRefreshKey: Date.now(),
            showModal: false,
            ready: false,
            images: {},
            renderedImages: [],
            activeMetric: '',
            showMetric: null,
            showMetricImage: null,
            showMetricFigure: null,
            loadingBarPinAlternate: false,
            logoPopAnimation: "stop",
            filters: {
                primary: {
                    UI: {
                        filter: '',
                        invert: 'match'
                    },
                    server: {
                        filter: '',
                        invert: 'match'
                    }
                    
                },
                secondary: {
                    UI: {
                        filter: '',
                        invert: 'match'
                    },
                    server: {
                        filter: '',
                        invert: 'match'
                    }
                }
            },
            showLoading: false,
            datasourceDisconnect: false

        }
        this.clock = new Clock();
        this.clockKeys = {
            metricFetch: "metricFetch",
            cleanUpReshadeCache: 'cleanUpReshadeCache',
            runFilters: 'runFilters'
        }
        this.refreshInterval = () => {
            return Number(this.props.options.refreshRate);
        };
        this.reshade = new Reshade();
    }

    componentDidMount = () => {

        this.clock.addTask(this.clockKeys.cleanUpReshadeCache, () => {
            this.reshade.cleanUpCache(60000);
        }, 60000);

        this.processDatasource();
    }

    processDatasource = () => {

        if (!this.props.data.series.length || this.props.data.series[0].name !== 'anomalizer') {
            this.setState(update(this.state, { datasourceDisconnect: {$set: true} }));
            return;
        }

        let metrics = this.props.data.series[0].fields[0].values.buffer[0] as {[key: string]: MetricImage}

        this.setState(update(this.state, { images: {$set: metrics }, datasourceDisconnect: {$set: false}, ready: {$set: true}}), () => {
            this.renderImages();
        })
    }

    componentDidUpdate = (prevProps: Props) => {
        if (JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options)) {
            this.processDatasource();
        }
    }

    componentWillUnmount = () => {
        this.clock.removeAllTasks();
    }

    openModal = () => {
        this.setState(update(this.state, { showModal: {$set: true} }));
    }

    closeModal = () => {
        this.setState(update(this.state, { showModal: {$set: false} }));
    }

    updateShowMetricFigure = async () => {
        let r = await Fetch(this.props.options.endpoint + '/figure/' + this.state.showMetric);
        let figure = await r.json();

        figure.layout = this.reshadeMetricLayout(figure.layout);

        this.setState(update(this.state, { showMetricFigure: {$set: figure} }))
    }

    showMetric = () => {
        this.setState(update(this.state, { showMetric: {$set: this.state.activeMetric}, showMetricImage: {$set: this.state.images[this.state.activeMetric]} }), async () => {
            await this.updateShowMetricFigure();
            this.clock.addTask('showMetricFigureUpdate', this.updateShowMetricFigure, 10000);
        });
    }

    hideMetric = () => {
        this.clock.removeTask('showMetricFigureUpdate');
        this.setState(update(this.state, { showMetric: {$set: null}, showMetricImage: {$set: null}, showMetricFigure: {$set: null} }));
    }

    reshadeMetricLayout = (layout: MetricFigureLayout): MetricFigureLayout => {
        return this.reshade.metricLayout(layout);
    }

    reshadeMetricImage = (img: string): string => {
        return this.reshade.metricImage(img);
    }

    renderImages = (callback?: () => void) => {

        let images = {...this.state.images};

        if (this.state.filters.primary.UI.filter.length || this.state.filters.secondary.UI.filter.length) {
            for (let chartId in images) {

                let chart: MetricImage = images[chartId];
    
                let searchString = chart.metric + ',' + JSON.stringify(chart.tags) + ',' + JSON.stringify({status: chart.status}) + ',' + chart.type + ',' + JSON.stringify({ features: chart.features }) + ',' + JSON.stringify({ cardinality: chart.cardinality }) + ',' + JSON.stringify({ plot: chart.plot });
    
                try {
                    if (this.state.filters.primary.UI.invert === 'notMatch') {
                        if (searchString.match(`${this.state.filters.primary.UI.filter}`)) {
                            delete images[chartId];
                            continue;
                        }
                    } else {
                        if (!searchString.match(`${this.state.filters.primary.UI.filter}`)) {
                            delete images[chartId];
                            continue;
                        }
                    }

                    if (this.state.filters.secondary.UI.invert === 'notMatch') {
                        if (searchString.match(`${this.state.filters.secondary.UI.filter}`)) {
                            delete images[chartId];
                            continue;
                        }
                    } else {
                        if (!searchString.match(`${this.state.filters.secondary.UI.filter}`)) {
                            delete images[chartId];
                            continue;
                        }
                    }

                    

                } catch (e) {
                    delete images[chartId];
                    continue;
                }
    
            }
        }

        let sortedMetrics: {[key: string]: MetricImage[]} = {
            critical: [],
            warning: [],
            normal: []
        }

        for (let metricId in images) {

            let chart = images[metricId];

            let weight = (
                this.props.options.metricWeightPreference === 'alpha' ? -chart.metric.charCodeAt(0): 
                this.props.options.metricWeightPreference === 'spike' ? chart.stats.spike: 
                this.props.options.metricWeightPreference === 'rstd' ? chart.stats.rstd : 
                this.props.options.metricWeightPreference === 'max' ? chart.stats.max : 
                this.props.options.metricWeightPreference === 'rmax' ? chart.stats.rmax : 
                this.props.options.metricWeightPreference === 'mean' ? chart.stats.mean : 
                chart.stats.std) + Math.abs((chart.features.increasing?.increase ?? 0) + (chart.features.decreasing?.decrease ?? 0)) + (Math.abs(chart.features.hockeystick?.increasing || chart.features.hockeystick?.increasing || 0)); 

            chart.weight = weight;

            sortedMetrics[images[metricId].status].push(chart);
        }

        for (let status in sortedMetrics) {

            // timeseries or scatter
            sortedMetrics[status] = sortedMetrics[status].filter(metric => {
                return metric.plot === this.props.options.metricType;
            })

            // sort based on weight
            sortedMetrics[status] = sortedMetrics[status].sort((a, b) => {
                if ( a.weight < b.weight ){
                    return 1;
                }
                if ( a.weight > b.weight ){
                    return -1;
                }

                return 0;
            })
        }


        this.setState(update(this.state, { renderedImages: {$set: [...sortedMetrics.critical, ...sortedMetrics.warning, ...sortedMetrics.normal]} }), callback);
    }

    render = () => {



        return <GrafanaUI.ThemeContext.Consumer>
            {theme => {
        
                return <div style={{ overflow: 'scroll', width: "100%", height: "100%" }} >

                    <MetricModal isOpen={this.state.showMetric !== null} onDismiss={this.hideMetric} figure={this.state.showMetricFigure} image={this.state.showMetricImage} />

                    {this.state.renderedImages.map((metric, i) => {

                        metric.img = this.reshadeMetricImage(metric.img);

                        return <MetricGridSquare key={metric.id} metric={metric} onClick={() => {
                            this.setState(update(this.state, { activeMetric: {$set: metric.id} }), () => {
                                this.showMetric();
                            })
                        }} />

                    })}

                    {this.state.renderedImages.length < 1 && !this.state.datasourceDisconnect && <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} >
                        <GrafanaUI.Icon name="question-circle" size="xxl" style={{ color: 'gray' }} />
                        <div style={{ height: 10 }} />
                        <h2>No metrics to display</h2>
                        {<p>No metrics are reported from the Datasource with this panel's query</p>}
                    </div>}

                    {this.state.datasourceDisconnect && <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} >
                        <GrafanaUI.Icon name="x" size="xxl" style={{ color: 'gray' }} />
                        <div style={{ height: 10 }} />
                        <h2>Datasource disconnected</h2>
                        <div style={{ height: 10 }} />
                        <p>This panel isn't connected to a Datasource</p>
                        <p>Edit this panel to add a query from the Anomzlier Datasource</p>
                    </div>}

                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

