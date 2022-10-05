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
    datasourceDisconnect: boolean,
    datasourceInstanceSettings: {
        jsonData: {
            endpoint: string | null
        }
    }
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
            datasourceDisconnect: false,
            datasourceInstanceSettings: {
                jsonData: {
                    endpoint: null
                }
            }

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

        let metrics = this.props.data.series[0].fields[0].values.buffer[0] as MetricImage[];


        this.setState(update(this.state, { renderedImages: {$set: metrics }, images: {$set: (() => {

            let metricsObject: {[key: string]: MetricImage} = {}

            console.log('metrics', metrics);

            for (let metric of metrics) {
                metricsObject[metric.id] = metric;
            }

            return metricsObject;

        })()}, datasourceDisconnect: {$set: false}, ready: {$set: true}, datasourceInstanceSettings: {$set: this.props.data.series[0].fields[0].config.custom.instanceSettings}}))
    }

    componentDidUpdate = (prevProps: Props) => {

        if (JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options) || JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data)) {
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
        let r = await Fetch(this.state.datasourceInstanceSettings.jsonData.endpoint + '/figure/' + this.state.showMetric);
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

    render = () => {

        return <GrafanaUI.ThemeContext.Consumer>
            {theme => {
        
                return <div style={{ overflow: 'scroll', width: "100%", height: "100%" }} >

                    <MetricModal isOpen={this.state.showMetric !== null} onDismiss={this.hideMetric} figure={this.state.showMetricFigure} image={this.state.showMetricImage} />

                    {!this.state.datasourceDisconnect && this.state.renderedImages.map((metric, i) => {

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
                        <p>This Anomalizer panel isn't connected to an Anomalizer Datasource</p>
                        <p>Edit this panel to add a query of the Anomalizer Datasource</p>
                    </div>}

                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

