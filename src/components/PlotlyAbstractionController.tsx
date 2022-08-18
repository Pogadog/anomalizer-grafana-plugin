import React, { Component } from 'react';
import { v4 as uuid } from 'uuid';
const Plotly = require("../plotly/plotly.min.js");

interface PlotlyGraphDiv {
    on: (event: string, cb: () => void) => void
    /* type polyfill. will add more gd types when needed */
}

interface Props {
    data: Array<{
        [key: string]: any
    }>;
    style: React.CSSProperties;
    layout: Object;
    activeTags: string[]
}

interface State {

}

export default class PlotlyAbstractionController extends Component<Props, State> {

    id: string

    constructor(props: Props) {
        super(props);
        this.id = uuid();
    }

    renderPlot = () => {
        let data = this.props.data;

        let visibilityDeclaredData: Array<{ [key: string]: any }> = [];

        for (let trace of data) {
            trace.visible = this.props.activeTags.includes(trace.name) ? true : "legendonly";
            visibilityDeclaredData.push(trace);
        }

        data = visibilityDeclaredData;

        let plot = document.getElementById(this.id);
        Plotly.newPlot( plot, data, this.props.layout, { displaylogo: false } ).then((gd: PlotlyGraphDiv) => {
            gd.on('plotly_legendclick', () => false);
        });
    }

    componentDidMount = () => {
        this.renderPlot();
    }

    componentDidUpdate = () => {
        this.renderPlot();
    }

    render = () => {
        return <div id={this.id} style={this.props.style}></div>
    }

}
