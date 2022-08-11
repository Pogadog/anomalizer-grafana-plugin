import React, { Component } from 'react';
import { toDataFrame, FieldType } from '@grafana/data';
import * as GrafanaUI from '@grafana/ui';
import PlotlyAbstractionController from './PlotlyAbstractionController';
import MetricFigure from 'types/MetricFigure';
import MetricImage from 'types/MetricImage';


interface Props {
    isOpen: boolean
    onDismiss: () => void
    figure: MetricFigure | null
    image: MetricImage | null
}

interface State {

}

export default class MetricModal extends Component<Props, State> {

    render = () => {

        if (!this.props.figure || !this.props.image) return null;

        return <GrafanaUI.Modal isOpen={this.props.isOpen} title="Metric Details" onDismiss={this.props.onDismiss} >
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%" }} >
                {!this.props.figure && <img src={this.props.image?.img} style={{ width: 400, height: 400, borderRadius: 10, opacity: 0.2 }} />}
                {!this.props.figure && <div style={{ position: 'absolute' }} >
                    <GrafanaUI.LoadingPlaceholder  />
                </div>}
                {this.props.figure && <div style={{ borderRadius: 10 }} ><PlotlyAbstractionController data={this.props.figure.data} layout={this.props.figure.layout} style={{ width: 400, height: 400, borderRadius: 10 }} /></div>}
                <div style={{ alignSelf: 'flex-start' }} >
                    <p style={{ fontSize: 24}} >Metric</p>
                    <p style={{ marginLeft: 20 }} >{this.props.image?.metric}</p>
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
    }

}