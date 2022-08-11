import React, { Component } from 'react';
import { v4 as uuid } from 'uuid';
const Plotly = require("../plotly/plotly.min.js");

interface Props {
    data: Object;
    style: React.CSSProperties;
    layout: Object;
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
        let plot = document.getElementById(this.id);
        Plotly.newPlot( plot, this.props.data, this.props.layout, { displaylogo: false } );
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
