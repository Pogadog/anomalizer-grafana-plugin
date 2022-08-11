import React, { Component } from 'react';


interface Props {
    onClick: () => void
    metric: {
        [key: string]: any
    }
}

interface State {

}

export default class MetricGridSquare extends Component<Props, State> {

    render = () => {
        return <div style={{ display: 'inline-block', position: 'relative', width: 150, height: 150, margin: 5, cursor: 'pointer' }} onMouseDown={() => {
        }} onClick={this.props.onClick} >
            <img src={this.props.metric.img} style={{ position: 'absolute', width: "100%", height: "100%", borderRadius: 10, zIndex: 1 }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: "100%", height: "100%", zIndex: 2, borderRadius: 10, alignItems: 'center' }} >
                

            </div>
        </div>;
    }
}