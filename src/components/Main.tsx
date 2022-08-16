import React, { Component } from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
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

interface Props extends PanelProps<Options> {};
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
                
                await fetch(this.props.options.endpoint + '/filter', { 
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

            let r = await fetch(this.props.options.endpoint + '/images');
            let images = await r.json();

            this.setState(update(this.state, { logoPopAnimation: {$set: this.state.ready ? "start" : "stop"} }), () => {
                setTimeout(() => {
                    this.setState(update(this.state, { ready: {$set: true}, images: {$set: images}}), () => {
                        this.renderImages();
                        setTimeout(() => {
                            this.setState(update(this.state, { loadingBarPinAlternate: {$set: !this.state.loadingBarPinAlternate }, logoPopAnimation: {$set: "start"} }));
                        }, 0);
        
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
        let r = await fetch(this.props.options.endpoint + '/figure/' + this.state.showMetric);
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

    renderImages = () => {

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
            sortedMetrics[images[metricId].status].push(images[metricId]);
        }


        this.setState(update(this.state, { renderedImages: {$set: [...sortedMetrics.critical, ...sortedMetrics.warning, ...sortedMetrics.normal]} }));
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

                    
                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

