import React, { Component } from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import * as GrafanaUI from '@grafana/ui';
import update from 'immutability-helper';
import Clock from './Clock';
import Theme from 'values/Theme';
const Plotly = require("../plotly/plotly.min.js");

interface Props extends PanelProps<Options> {};
interface State {
    showModal: boolean,
    ready: boolean,
    images: any,
    hover: string,
    showMetric: string | null,
    showMetricData: Object | null
}
export default class Main extends Component<Props, State> {

    clock: Clock
    clockKeys: {
        [key: string]: string
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            showModal: false,
            ready: false,
            images: {},
            hover: '',
            showMetric: null,
            showMetricData: null
        }
        this.clock = new Clock();
        this.clockKeys = {
            metricFetch: "metricFetch"
        }
    }

    componentDidMount = () => {
        this.clock.addTask(this.clockKeys.metricFetch, async () => {
            let r = await fetch(this.props.options.endpoint + '/images');
            r = await r.json();
            this.setState(update(this.state, { ready: {$set: true}, images: {$set: r} }))
        }, 10000);
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

    getPlotlyContainerId = () => {
        return "plotly-render-" + this.state.showMetric;
    }

    showMetric = () => {
        this.setState(update(this.state, { showMetric: {$set: this.state.hover} }), () => {
            let plot = document.getElementById(this.getPlotlyContainerId());
            Plotly.newPlot( plot, [{
            x: [1, 2, 3, 4, 5],
            y: [1, 2, 4, 8, 16] }], {
            margin: { t: 0 } } );
        });
    }

    hideMetric = () => {
        this.setState(update(this.state, { showMetric: {$set: null} }));
    }

    render = () => {

        return <GrafanaUI.ThemeContext.Consumer>
            {theme => {
                if (!this.state.ready) return <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                    <GrafanaUI.LoadingPlaceholder text={`Loading metrics from ${this.props.options.endpoint}`} />
                </div>
        
                return <div style={{ overflow: 'scroll', width: "100%", height: "100%" }} >

                    <GrafanaUI.Modal isOpen={this.state.showMetric !== null} title="Metric Details" onDismiss={this.hideMetric} >
                        <div id={this.getPlotlyContainerId()} style={{width: 600, height: 250}}></div>
                    </GrafanaUI.Modal>



                    {Object.keys(this.state.images).map((id, i) => {
                        
                        let metric = this.state.images[id];
                        if (metric.plot !== this.props.options.metricType) return null;

                        let p = new DOMParser();
                        let x = p.parseFromString(decodeURIComponent(metric.img.split(",", 2)[1]), "image/svg+xml");

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

                        metric.img = "data:image/svg+xml," + encodeURIComponent(new XMLSerializer().serializeToString(x))
        
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

