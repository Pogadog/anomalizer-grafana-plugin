import React, { Component } from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import * as GrafanaUI from '@grafana/ui';
import update from 'immutability-helper';
import Clock from './Clock';

interface Props extends PanelProps<Options> {};
interface State {
    showModal: boolean,
    ready: boolean,
    images: any
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
            images: {}
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

    render = () => {

        console.log(this.props);

        if (!this.state.ready) return <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
            <GrafanaUI.LoadingPlaceholder text={`Loading metrics from ${this.props.options.endpoint}`} />
        </div>

        return <div style={{ overflow: 'scroll', width: "100%", height: "100%" }} >
            {Object.keys(this.state.images).map(id => {
                let metric = this.state.images[id];
                console.log(metric.plot, this.props.options.metricType);
                if (metric.plot !== this.props.options.metricType) return null;
                return <img src={metric.img} style={{ width: 150, height: 150, padding: 5, borderRadius: 10 }} />;
            })}
        </div>
    }

}

