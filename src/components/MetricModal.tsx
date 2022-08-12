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

interface TagDataFrame {
    name: string;
    fields: {
        name: string;
        type: FieldType;
        values: any[]
    }[]
}

interface TagGridMap {
    [key: string]: any[]
}

export default class MetricModal extends Component<Props, State> {

    ref: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.state = {

        }
        this.ref = React.createRef();
    }

    buildTagGrid = (tags: MetricImage["tags"]): TagDataFrame => {
        let tagGridMap: TagGridMap = {}
        for (let tag of tags) {
            for (let point in tag) {
                if (!tagGridMap[point]) tagGridMap[point] = [];
                tagGridMap[point].push(String(tag[point]))
            }
        }


        let dataFrameBuild = {
            name: '',
            fields: [{
                name: 'Tag',
                type: FieldType.string,
                values: tagGridMap[Object.keys(tagGridMap)[0]].map((tag, i) => {
                    return String(i);
                })

            }, ...Object.keys(tagGridMap).map(tag => {
                return {name: tag.charAt(0).toUpperCase() + tag.slice(1), type: FieldType.string, values: tagGridMap[tag]}
            })],
        }

        return dataFrameBuild;

    }

    render = () => {

        if (!this.props.figure || !this.props.image) return null;

        let tags = this.buildTagGrid(this.props.image.tags);

        let modalWidth = this.ref.current?.getBoundingClientRect().width ?? 200;

        return <GrafanaUI.Modal isOpen={this.props.isOpen} title="Metric Details" onDismiss={this.props.onDismiss} >
            <div ref={this.ref} style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%", }} >
                {!this.props.figure && <img src={this.props.image?.img} style={{ width: 400, height: 400, borderRadius: 10, opacity: 0.2 }} />}
                {!this.props.figure && <div style={{ position: 'absolute' }} >
                    <GrafanaUI.LoadingPlaceholder  />
                </div>}
                {this.props.figure && <div style={{ borderRadius: 10 }} ><PlotlyAbstractionController data={this.props.figure.data} layout={this.props.figure.layout} style={{ width: 400, height: 400, borderRadius: 10 }} /></div>}
                <div style={{ alignSelf: 'flex-start' }} >
                    <p style={{ fontSize: 24}} >Metric</p>
                    <p style={{ marginLeft: 20 }} >{this.props.image?.metric}</p>
                    <p style={{ fontSize: 24}} >Tags</p>
                    <div style={{ overflow: 'scroll', width:modalWidth }} >
                        <GrafanaUI.Table width={modalWidth} height={400} data={toDataFrame(tags)} />
                    </div>
                    
                </div>
            </div>
        </GrafanaUI.Modal>
    }

}