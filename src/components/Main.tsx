import React, { Component } from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import * as GrafanaUI from '@grafana/ui';
import update from 'immutability-helper';

export default class Main extends Component {

    state: {
        showModal: boolean,
        ready: boolean
    }

    constructor(props: PanelProps<Options>) {
        super(props);
        this.state = {
            showModal: false,
            ready: false
        }
    }

    componentDidMount = () => {
        
    }

    openModal = () => {
        this.setState(update(this.state, { showModal: {$set: true} }));
    }

    closeModal = () => {
        this.setState(update(this.state, { showModal: {$set: false} }));
    }

    render = () => {
        if (!this.state.ready) return <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
            <GrafanaUI.LoadingPlaceholder text="Loading..." />
        </div>

        return <div>
            <GrafanaUI.Button onClick={this.openModal}>Open Modal</GrafanaUI.Button>
            <GrafanaUI.Modal title="A Modal" isOpen={this.state.showModal} onDismiss={this.closeModal} />
        </div>
    }

}

