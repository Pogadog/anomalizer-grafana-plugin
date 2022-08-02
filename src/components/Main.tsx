import React, { Component } from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import * as GrafanaUI from '@grafana/ui';
import update from 'immutability-helper';
import Clock from './Clock';
import Theme from 'values/Theme';

interface Props extends PanelProps<Options> {};
interface State {
    showModal: boolean,
    ready: boolean,
    images: any,
    hover: string
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
            hover: ''
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

        return <GrafanaUI.ThemeContext.Consumer>
            {theme => {
                console.log("theme", theme);
                console.log(this.props);

                if (!this.state.ready) return <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                    <GrafanaUI.LoadingPlaceholder text={`Loading metrics from ${this.props.options.endpoint}`} />
                </div>
        
                return <div style={{ overflow: 'scroll', width: "100%", height: "100%" }} >
                    {Object.keys(this.state.images).map(id => {
                        let metric = this.state.images[id];
                        if (metric.plot !== this.props.options.metricType) return null;
        
                        let isHovered = this.state.hover === id;
        
                        return <div style={{ display: 'inline-block', position: 'relative', width: 150, height: 150, margin: 5 }} onMouseEnter={() => {
                            this.setState(update(this.state, { hover: {$set: id} }));
                        }} onMouseLeave={() => {
                            this.setState(update(this.state, { hover: {$set: ""} }));
                        }} >
                            <img src={metric.img} style={{ position: 'absolute', width: "100%", height: "100%", borderRadius: 10, zIndex: 1 }} />
                            {isHovered && <div style={{ position: 'absolute', top: 0, bottom: 0, width: "100%", height: "100%", zIndex: 2, borderRadius: 10, alignItems: 'center' }} >
                                <div style={{ position: 'absolute', bottom: 0, left: 0, marginLeft: 10, marginBottom: 5, backgroundColor: Theme.colors.palette.primary, borderRadius: 90, padding: 5, paddingLeft: 8, paddingRight: 8, cursor: 'pointer' }} ><GrafanaUI.Icon name="eye" color="yellow" /></div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, marginRight: 10, marginBottom: 5, backgroundColor: Theme.colors.palette.primary, borderRadius: 90, padding: 5, paddingLeft: 8, paddingRight: 8, cursor: 'pointer' }} ><GrafanaUI.Icon name="plus" /></div>
        
                            </div>}
                        </div>;
                    })}
                </div>
            }}
        </GrafanaUI.ThemeContext.Consumer>

    }

}

