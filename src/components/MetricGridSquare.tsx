import React, { Component } from 'react';
import MetricImage from 'types/MetricImage';
import MetricStatusColors from 'values/MetricStatusColors';
import DistributionIndicator from './DistributionIndicator';
import MetricIcon from './MetricIcon';


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
            <img src={this.props.metric.img} style={{ position: 'absolute', width: "100%", height: "100%", borderRadius: 10 }} />
            {this.props.metric.features.increasing && <MetricIcon name="trendingUp" size={14} theme="secondary" style={{ position: 'absolute', bottom: 0, left: 0, margin: 5, zIndex: 2 }} />}
            {this.props.metric.features.decreasing && <MetricIcon name="trendingDown" size={14} theme="primary" style={{ position: 'absolute', bottom: 0, left: 0, margin: 5, zIndex: 2 }} />}
            {this.props.metric.features.hockeystick?.increasing && <MetricIcon name="hockeystickIncreasing" size={14} theme="secondary" style={{ position: 'absolute', bottom: 0, left: 0, margin: 5, zIndex: 2 }} />}
            {this.props.metric.features.hockeystick?.decreasing && <MetricIcon name="hockeystickDecreasing" size={14} theme="primary" style={{ position: 'absolute', bottom: 0, left: 0, margin: 5, zIndex: 2 }} />}

            <DistributionIndicator metric={this.props.metric} style={{position: 'absolute', bottom: 5, right: 10}} />
        </div>;
    }
}