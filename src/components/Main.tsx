import React, { Component } from 'react';
import { PanelProps, toDataFrame, FieldType } from '@grafana/data';
import { Options } from 'types';
import * as GrafanaUI from '@grafana/ui';
import update from 'immutability-helper';
import Clock from './Clock';
import Theme from 'values/Theme';
import PlotlyAbstractionController from './PlotlyAbstractionController';

import '../styles/root.css';

interface MetricImage {
    cardinality: string
    features: {
        [key: string]: number | string
    }
    id: string
    img: string
    metric: string
    plot: "timeseries" | "scatter"
    prometheus: string
    stats: {
        [key: string]: number
    }
    status: "normal" | "warning" | "critical"
    tags: [{
        [key: string]: string
    }]
    type: string
}

interface MetricFigure {
    data: [
        {
            hovertemplate: string,
            legendgroup: string,
            line: {
                color: string,
                dash: string
            },
            marker: {
                symbol: string
            },
            mode: string,
            name: string,
            orientation: string,
            showlegend: boolean,
            type: string,
            x: [number],
            xaxis: "x",
            y: [number],
            yaxis: "y"
        }
    ],
    layout: {
        paper_bgcolor: string
        plot_bgcolor: string
        autosize: boolean,
        font: {
            size?: number,
            color?: string
        },
        height: number,
        legend: {
            title: {
                text: string
            },
            tracegroupgap: 0
        },
        showlegend: boolean,
        template: object,
        title: {
            text: string,
            x: number,
            xanchor: string,
            font: {
                color: string
            }
        },
        width: number,
        xaxis: {
            anchor: "x" | "y",
            domain: [number],
            showgrid: boolean,
            title: {
                text: string
            }
        },
        yaxis: {
            anchor: "x" | "y",
            domain: [number],
            showgrid: boolean,
            title: {
                text: string
            }
        }
    }
}

type MetricFigureLayout = MetricFigure["layout"];

interface Props extends PanelProps<Options> {};
interface State {
    showModal: boolean,
    ready: boolean,
    images: any,
    hover: string,
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
            hover: '',
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
        this.setState(update(this.state, { showMetric: {$set: this.state.hover}, showMetricImage: {$set: this.state.images[this.state.hover]} }), async () => {
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
                    
                    <div style={{ height: 2, backgroundColor: this.state.loadingBarPinAlternate ? Theme.colors.palette.primary : Theme.colors.palette.secondary, marginLeft: this.state.loadingBarPinAlternate ? undefined : 'auto', marginRight: this.state.loadingBarPinAlternate ? undefined : 0 }} className="loading-bar" data-state={this.state.loadingBarPinAlternate ? "collapsed" : null} data-refresh-interval={this.refreshInterval} />

                    <GrafanaUI.Modal isOpen={this.state.showMetric !== null} title="Metric Details" onDismiss={this.hideMetric} >
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%" }} >
                            {!this.state.showMetricFigure && <img src={this.state.showMetricImage?.img} style={{ width: 400, height: 400, borderRadius: 10, opacity: 0.2 }} />}
                            {!this.state.showMetricFigure && <div style={{ position: 'absolute' }} >
                                <GrafanaUI.LoadingPlaceholder  />
                            </div>}
                            {this.state.showMetricFigure && <div style={{ borderRadius: 10 }} ><PlotlyAbstractionController data={this.state.showMetricFigure.data} layout={this.state.showMetricFigure.layout} style={{ width: 400, height: 400, borderRadius: 10 }} /></div>}
                            <div style={{ alignSelf: 'flex-start' }} >
                                <p style={{ fontSize: 24}} >Metric</p>
                                <p style={{ marginLeft: 20 }} >{this.state.showMetricImage?.metric}</p>
                                <p style={{ fontSize: 24}} >Tags</p>
                                <GrafanaUI.Table width={200} height={200} data={toDataFrame({
                                    name: 'foo bar',
                                    fields: [
                                        { name: 'Tag', type: FieldType.string, values: ["one", "two"] },
                                        { name: 'Value', type: FieldType.number, values: [1, 2] },
                                    ],
                                })} />
                            </div>
                        </div>
                    </GrafanaUI.Modal>



                    {Object.keys(this.state.images).map((id, i) => {
                        
                        let metric = this.state.images[id];
                        if (metric.plot !== this.props.options.metricType) return null;

                        metric.img = this.reshadeMetricImage(metric.img);
        
                        let isHovered = this.state.hover === id;
        
                        return <div style={{ display: 'inline-block', position: 'relative', width: 150, height: 150, margin: 5 }} onMouseEnter={() => {
                            this.setState(update(this.state, { hover: {$set: id} }));
                        }} onMouseLeave={() => {
                            this.setState(update(this.state, { hover: {$set: ""} }));
                        }} >
                            <img src={metric.img} style={{ position: 'absolute', width: "100%", height: "100%", borderRadius: 10, zIndex: 1 }} />
                            {isHovered && <div style={{ position: 'absolute', top: 0, bottom: 0, width: "100%", height: "100%", zIndex: 2, borderRadius: 10, alignItems: 'center' }} >
                                <div style={{ position: 'absolute', bottom: 0, left: 0, marginLeft: 10, marginBottom: 5, backgroundColor: Theme.colors.palette.primary, borderRadius: 90, padding: 5, paddingLeft: 8, paddingRight: 8, cursor: 'pointer' }} onClick={this.showMetric} ><GrafanaUI.Icon name="eye" color="yellow" /></div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, marginRight: 10, marginBottom: 5, backgroundColor: Theme.colors.palette.primary, borderRadius: 90, padding: 5, paddingLeft: 8, paddingRight: 8, cursor: 'pointer' }} ><GrafanaUI.Icon name="plus" /></div>
        
                            </div>}
                        </div>;
                    })}
                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

