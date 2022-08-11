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
    loadingBarPinAlternate: boolean
}
export default class Main extends Component<Props, State> {

    clock: Clock
    clockKeys: {
        [key: string]: string
    }

    refreshInterval: number;

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
            loadingBarPinAlternate: false
        }
        this.clock = new Clock();
        this.clockKeys = {
            metricFetch: "metricFetch"
        }
        this.refreshInterval = 15000;
    }

    componentDidMount = () => {
        this.clock.addTask(this.clockKeys.metricFetch, async () => {
            let r = await fetch(this.props.options.endpoint + '/images');
            r = await r.json();
            this.setState(update(this.state, { ready: {$set: true}, images: {$set: r}}), () => {
                setTimeout(() => {
                    this.setState(update(this.state, { loadingBarPinAlternate: {$set: !this.state.loadingBarPinAlternate } }));
                }, 0);
                
            })
        }, this.refreshInterval);
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

        layout.paper_bgcolor = "#222222"
        layout.plot_bgcolor = "#222222"
        if (!layout.font) layout.font = {}
        layout.font.color = "white"
        return layout;
    }

    reshadeMetricImage = (img: string): string => {
        let p = new DOMParser();
        let x = p.parseFromString(decodeURIComponent(img.split(",", 2)[1]), "image/svg+xml");

        let background = "#222222";

        if (x.getElementsByTagName("rect")[0]) {
            // set background color of whole metric
            x.getElementsByTagName("rect")[0].style.fill = background;
        }

        if (x.getElementsByClassName("xzl zl crisp")[0]) {
            // set background color of x boundary line
            (x.getElementsByClassName("xzl zl crisp") as HTMLCollectionOf<HTMLElement>)[0].style.stroke = "white";
        }

        if (x.getElementsByClassName("yzl zl crisp")[0]) {
            // set background color of y boundary line
            (x.getElementsByClassName("yzl zl crisp") as HTMLCollectionOf<HTMLElement>)[0].style.stroke = "white";
        }

        for (let i=0; i<x.getElementsByClassName("xtick").length; i++) {
            // set color of x axis ticks
            if (x.getElementsByClassName("xtick")[i]) {

                x.getElementsByClassName("xtick")[i].getElementsByTagName("text")[0].style.fill = "white"

            }
        
        }

        for (let i=0; i<x.getElementsByClassName("ytick").length; i++) {
            // set color of y axis ticks
            if (x.getElementsByClassName("ytick")[i]) {

                x.getElementsByClassName("ytick")[i].getElementsByTagName("text")[0].style.fill = "white"

            }
        
        }

        if (x.getElementsByClassName("gtitle")[0]) {
            // set color of title text
            (x.getElementsByClassName("gtitle") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }

        if (x.getElementsByClassName("bg")[0]) {
            // set background color of legend
            (x.getElementsByClassName("bg") as HTMLCollectionOf<HTMLElement>)[0].style.fill = background;
        }

        for (let i=0; i<x.getElementsByClassName("legendtext").length; i++) {
            // set color of line legend text(s)
            if (x.getElementsByClassName("legendtext")[i]) {

                (x.getElementsByClassName("legendtext") as HTMLCollectionOf<HTMLElement>)[i].style.fill = "white"
            }
        }

        if (x.getElementsByClassName("legendtitletext")[0]) {
            // set color of legend title text
            (x.getElementsByClassName("legendtitletext") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }


        if (x.getElementsByClassName("xtitle")[0]) {
            // set color of x axis label
            (x.getElementsByClassName("xtitle") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }

        if (x.getElementsByClassName("ytitle")[0]) {
            // set color of y axis label
            (x.getElementsByClassName("ytitle") as HTMLCollectionOf<HTMLElement>)[0].style.fill = "white";
        }

        return "data:image/svg+xml," + encodeURIComponent(new XMLSerializer().serializeToString(x))
    }

    render = () => {

        return <GrafanaUI.ThemeContext.Consumer>
            {theme => {
                if (!this.state.ready) return <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                    <GrafanaUI.LoadingPlaceholder text={`Loading metrics from ${this.props.options.endpoint}`} />
                </div>
        
                return <div style={{ overflow: 'scroll', width: "100%", height: "100%" }}>
                    
                    <div style={{ height: 2, borderRadius: 90, backgroundColor: this.state.loadingBarPinAlternate ? Theme.colors.palette.secondary : Theme.colors.palette.primary, marginLeft: this.state.loadingBarPinAlternate ? undefined : 'auto', marginRight: this.state.loadingBarPinAlternate ? undefined : 0 }} className="loading-bar" data-state={this.state.loadingBarPinAlternate ? "collapsed" : null} data-refresh-interval={this.refreshInterval} />

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

