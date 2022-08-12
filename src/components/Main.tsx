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

interface Props extends PanelProps<Options> {};
interface State {
    showModal: boolean,
    ready: boolean,
    images: any,
    activeMetric: string,
    showMetric: string | null,
    showMetricImage: MetricImage | null
    showMetricFigure: MetricFigure | null,
    loadingBarPinAlternate: boolean,
    logoPopAnimation: "stop" | "start"
}
export default class Main extends Component<Props, State> {

    clock: Clock
    clockKeys: {
        [key: string]: string
    }

    refreshInterval: number;

    reshade: Reshade;

    constructor(props: Props) {
        super(props);
        this.state = {
            showModal: false,
            ready: false,
            images: {},
            activeMetric: '',
            showMetric: null,
            showMetricImage: null,
            showMetricFigure: null,
            loadingBarPinAlternate: false,
            logoPopAnimation: "stop"
        }
        this.clock = new Clock();
        this.clockKeys = {
            metricFetch: "metricFetch",
            cleanUpReshadeCache: 'cleanUpReshadeCache'
        }
        this.refreshInterval = 30000;
        this.reshade = new Reshade();
    }

    componentDidMount = () => {
        setTimeout(() => {
            this.setState(update(this.state, { logoPopAnimation: {$set: "start"} }), () => {
                setTimeout(() => {
                    this.clock.addTask(this.clockKeys.metricFetch, async () => {

                        let r = await fetch(this.props.options.endpoint + '/images');
                        r = await r.json();

                        this.setState(update(this.state, { logoPopAnimation: {$set: this.state.ready ? "start" : "stop"} }), () => {
                            setTimeout(() => {
                                this.setState(update(this.state, { ready: {$set: true}, images: {$set: r}}), () => {
                                    setTimeout(() => {
                                        this.setState(update(this.state, { loadingBarPinAlternate: {$set: !this.state.loadingBarPinAlternate }, logoPopAnimation: {$set: "start"} }));
                                    }, 0);
                    
                                })
                            }, this.state.ready ? 0 : 100);
                        })
                        
                        
                        
                    }, this.refreshInterval);

                    this.clock.addTask(this.clockKeys.cleanUpReshadeCache, () => {
                        this.reshade.cleanUpCache(this.refreshInterval);
                    }, this.refreshInterval);

                }, 2000);
            })
        }, 100);
        
        
        //this.setState(update(this.state, { loadingBarStateAttr: {$set: 'collapsed'} }));

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

    render = () => {

        return <GrafanaUI.ThemeContext.Consumer>
            {theme => {
                if (!this.state.ready) return <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%" }} >
                    <img className="logo-pop" src="https://anomalizer.app/logo.svg" data-animation={this.state.logoPopAnimation} />
                </div>
        
                return <div className="main-grid-load" style={{ overflow: 'scroll', width: "100%", height: "100%" }} data-animation={this.state.logoPopAnimation} >
                    
                    <div style={{ height: 2, marginBottom: 10, borderRadius: 90, backgroundColor: this.state.loadingBarPinAlternate ? Theme.colors.palette.secondary : Theme.colors.palette.primary, marginLeft: this.state.loadingBarPinAlternate ? undefined : 'auto', marginRight: this.state.loadingBarPinAlternate ? undefined : 0, transitionDuration: `${(this.refreshInterval / 1000) - .5}s` }} className="loading-bar" data-state={this.state.loadingBarPinAlternate ? "collapsed" : null} data-refresh-interval={this.refreshInterval} />

                    <MetricModal isOpen={this.state.showMetric !== null} onDismiss={this.hideMetric} figure={this.state.showMetricFigure} image={this.state.showMetricImage} />

                    {Object.keys(this.state.images).map((id, i) => {
                        
                        let metric = this.state.images[id];
                        if (metric.plot !== this.props.options.metricType) return null;

                        metric.img = this.reshadeMetricImage(metric.img);

                        return <MetricGridSquare metric={metric} onClick={() => {
                            this.setState(update(this.state, { activeMetric: {$set: id} }), () => {
                                this.showMetric();
                            })
                        }} />

                    })}
                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

