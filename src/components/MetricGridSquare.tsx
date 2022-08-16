import React, { Component } from 'react';
import MetricImage from 'types/MetricImage';
import MetricStatusColors from 'values/MetricStatusColors';


interface Props {
    onClick: () => void
    metric: MetricImage
}

interface State {

}

export default class MetricGridSquare extends Component<Props, State> {

    render = () => {

        return <div style={{ display: 'inline-block', position: 'relative', width: 150, height: 150, margin: 5, cursor: 'pointer', borderWidth: 1, borderRadius: 10, borderStyle: 'solid', borderColor: this.props.metric.status === 'critical' ? MetricStatusColors.critical : this.props.metric.status === 'warning' ? MetricStatusColors.warning : 'transparent' }} onMouseDown={() => {
        }} onClick={this.props.onClick} >
            <img src={this.props.metric.img} style={{ position: 'absolute', width: "100%", height: "100%", borderRadius: 10, zIndex: 1 }} />
        </div>;
    }
}