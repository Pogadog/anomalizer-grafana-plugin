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
    metricsRefreshKey: number
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

    processIncomingFilters = async () => {
        this.processIncomingFiltersTimeout && clearTimeout(this.processIncomingFiltersTimeout);
        this.processIncomingFiltersTimeout = setTimeout(() => {
            this.setState(update(this.state, { filters: {$set: {
                primary: {
                    UI: {
                        filter: this.props.options.primaryUIFilter || '',
                        invert: this.props.options.primaryUIFilterInvert
                    },
                    server: {
                        filter: this.props.options.primaryServerFilter || '',
                        invert: this.props.options.primaryServerFilterInvert
                    }
                },
                secondary: {
                    UI: {
                        filter: this.props.options.secondaryUIFilter || '',
                        invert: this.props.options.secondaryUIFilterInvert
                    },
                    server: {
                        filter: this.props.options.secondaryServerFilter || '',
                        invert: this.props.options.secondaryServerFilterInvert
                    }
                }
            }} }), async () => {
                
                await Fetch(this.props.options.endpoint + '/filter', { 
                    method: 'POST',
                    headers: {
                        'Accept-Type': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        query: this.props.options.primaryServerFilter,
                        //query2: this.props.options.secondaryServerFilter,
                        invert: this.props.options.primaryServerFilterInvert === 'notMatch',
                        //invert2: this.props.options.secondaryServerFilterInvert === 'notMatch'
                    })
                })
                this.renderImages();
            })
        }, 500);
    }

    registerClocks = () => {
        this.clock.removeTask(this.clockKeys.metricFetch);
        this.clock.removeTask(this.clockKeys.cleanUpReshadeCache);

        this.clock.addTask(this.clockKeys.metricFetch, async () => {

            let r = await Fetch(this.props.options.endpoint + '/images');
            let images = await r.json();

            this.setState(update(this.state, { logoPopAnimation: {$set: this.state.ready ? "start" : "stop"} }), () => {
                setTimeout(() => {
                    this.setState(update(this.state, { ready: {$set: true}, images: {$set: images}}), () => {
                        this.renderImages(() => {
                            setTimeout(() => {
                                this.setState(update(this.state, { loadingBarPinAlternate: {$set: !this.state.loadingBarPinAlternate }, logoPopAnimation: {$set: "start"} }));
                            }, 100);
                        });
                    })
                }, this.state.ready ? 0 : 100);
            })
            
            
            
        }, this.refreshInterval());

        this.clock.addTask(this.clockKeys.cleanUpReshadeCache, () => {
            this.reshade.cleanUpCache(this.refreshInterval());
        }, this.refreshInterval());
    }

    componentDidMount = () => {

        this.processIncomingFilters();

        setTimeout(() => {
            this.setState(update(this.state, { logoPopAnimation: {$set: "start"} }), () => {
                setTimeout(() => {
                    this.registerClocks();
                }, 2000);
            })
        }, 100);
        
        
        //this.setState(update(this.state, { loadingBarStateAttr: {$set: 'collapsed'} }));

    }

    componentDidUpdate = (prevProps: Props) => {
        if (JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options)) {
            this.processIncomingFilters();
        }
        if (this.props.options.refreshRate !== prevProps.options.refreshRate) {
            this.registerClocks();
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

                if (!this.state.ready) return <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%" }} >
                    <img className="logo-pop" src={logo} data-animation={this.state.logoPopAnimation} />
                </div>
        
                return <div className="main-grid-load" style={{ overflow: 'scroll', width: "100%", height: "100%" }} data-animation={this.state.logoPopAnimation} >
                    
                    <div style={{ height: 2, marginBottom: 10, borderRadius: 90, backgroundColor: this.state.loadingBarPinAlternate ? Theme.colors.palette.secondary : Theme.colors.palette.primary, marginLeft: this.state.loadingBarPinAlternate ? undefined : 'auto', marginRight: this.state.loadingBarPinAlternate ? undefined : 0, transitionDuration: `${(this.refreshInterval() / 1000) - .5}s` }} className="loading-bar" data-state={this.state.loadingBarPinAlternate ? "collapsed" : null} data-refresh-interval={this.refreshInterval()} />

                    <MetricModal isOpen={this.state.showMetric !== null} onDismiss={this.hideMetric} figure={this.state.showMetricFigure} image={this.state.showMetricImage} />

                    {this.state.renderedImages.map((metric, i) => {
                        
                        if (metric.plot !== this.props.options.metricType) return null;

                        metric.img = this.reshadeMetricImage(metric.img);

                        return <MetricGridSquare metric={metric} onClick={() => {
                            this.setState(update(this.state, { activeMetric: {$set: metric.id} }), () => {
                                this.showMetric();
                            })
                        }} />

                    })}

                    {this.state.renderedImages.length < 1 && <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} >
                        <GrafanaUI.Icon name="question-circle" size="xxl" style={{ color: 'gray' }} />
                        <div style={{ height: 10 }} />
                        <h2>No metrics to display</h2>
                        {this.props.options.primaryUIFilter || this.props.options.secondaryUIFilter || this.props.options.secondaryUIFilter || this.props.options.secondaryServerFilter ? <p>There are no matrics that match the current filter(s)</p> : <p>There are no metrics to display</p>}
                    </div>}

                    
                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

