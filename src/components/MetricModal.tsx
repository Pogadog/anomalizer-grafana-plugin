import React, { Component } from 'react';
import { toDataFrame, FieldType } from '@grafana/data';
import * as GrafanaUI from '@grafana/ui';
import PlotlyAbstractionController from './PlotlyAbstractionController';
import MetricFigure from 'types/MetricFigure';
import MetricImage from 'types/MetricImage';
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';

interface Props {
    isOpen: boolean
    onDismiss: () => void
    figure: MetricFigure | null
    image: MetricImage | null
}

interface State {
    tagFilter: string
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

interface TagSearchStrings {
    [key: string]: string
}

export default class MetricModal extends Component<Props, State> {

    ref: React.RefObject<HTMLDivElement>;
    tagFilterTimeout: NodeJS.Timeout | null;
    tagControllerKey: string

    constructor(props: Props) {
        super(props);
        this.state = {
            tagFilter: ""
        }
        this.ref = React.createRef();
        this.tagFilterTimeout = null;
        this.tagControllerKey = "tagId-controllerKey-" + uuid();
    }

    buildTagGrid = (tags: MetricImage["tags"]): { dataFrameBuild: TagDataFrame, activeTags: string[] } => {
        let activeTags: string[] = [];
        let tagGridMap: TagGridMap = {}

        if (this.state.tagFilter) {

            let searchStrings: TagSearchStrings = {};

            tags.map((tag, index) => {
                // refined regex tag search
                searchStrings[index] = '"' + index + '": ' + JSON.stringify(tag, null, 1);
            });

            let matchingTags: MetricImage["tags"] = [];
            let i = 0;
            for (let tag in searchStrings) {
                let searchString = searchStrings[tag];
                if (searchString.match(`${this.state.tagFilter}`) || this.state.tagFilter.length < 1) {
                    matchingTags.push({...tags[i], [this.tagControllerKey]: String(i)});
                    activeTags.push(String(i));
                }
                i++;
            }

            tags = matchingTags;

            if (tags.length < 1) {
                return {
                    dataFrameBuild: {
                        name: '',
                        fields: [],
                    },
                    activeTags 
                }
            }

        } else {
            tags.map((_, index) => {
                activeTags.push(String(index));
            })
            tags = tags.map((tag, i) => {
                return {...tag, [this.tagControllerKey]: String(i)}
            })
        }

        for (let tag of tags) {
            for (let point in tag) {
                if (point === this.tagControllerKey) continue;
                if (!tagGridMap[point]) tagGridMap[point] = [];
                tagGridMap[point].push(String(tag[point]))
            }
        }


        let dataFrameBuild = {
            name: '',
            fields: [{
                name: 'Tag',
                type: FieldType.string,
                values: tags.map(tag => {
                    return tag[this.tagControllerKey];
                })

            }, ...Object.keys(tagGridMap).map(tag => {
                return {name: tag.charAt(0).toUpperCase() + tag.slice(1), type: FieldType.string, values: tagGridMap[tag]}
            })],
        }


        return { dataFrameBuild, activeTags };

    }

    render = () => {

        if (!this.props.figure || !this.props.image) return null;

        let { dataFrameBuild: tags, activeTags } = this.buildTagGrid(this.props.image.tags);

        let modalWidth = this.ref.current?.getBoundingClientRect().width ?? 200;

        return <GrafanaUI.Modal isOpen={this.props.isOpen} title="Metric Details" onDismiss={this.props.onDismiss} >
            <div ref={this.ref} style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%", }} >
                {!this.props.figure && <img src={this.props.image?.img} style={{ width: 400, height: 400, borderRadius: 10, opacity: 0.2 }} />}
                {!this.props.figure && <div style={{ position: 'absolute' }} >
                    <GrafanaUI.LoadingPlaceholder  />
                </div>}
                {this.props.figure && <div style={{ borderRadius: 10 }} ><PlotlyAbstractionController data={this.props.figure.data} layout={this.props.figure.layout} activeTags={activeTags} style={{ width: 400, height: 400, borderRadius: 10 }} /></div>}
                <div style={{ alignSelf: 'flex-start' }} >
                    <p style={{ fontSize: 24}} >Metric</p>
                    <p style={{ marginLeft: 20 }} >{this.props.image?.metric}</p>
                    <p style={{ fontSize: 24}} >Tags</p>
                    <GrafanaUI.Input prefix={<GrafanaUI.Icon name="search" />} placeholder="Search tags (regex)" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

                        let v = e.target.value;
                        this.tagFilterTimeout && clearTimeout(this.tagFilterTimeout);

                        this.tagFilterTimeout = setTimeout(() => {
                            this.setState(update(this.state, { tagFilter: {$set: v} }));
                        }, 500);
                    }} />
                    <div style={{ height: 10 }} />
                    <div style={{ overflow: 'scroll', width:modalWidth }} >
                        {tags.fields.length > 0 && <GrafanaUI.Table width={modalWidth} height={400} data={toDataFrame(tags)} />}
                        {tags.fields.length < 1 && <div style={{ width: modalWidth, height: 400, display: 'flex', flex: 1, justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'center' }} >
                            <GrafanaUI.Icon name="question-circle" size="xxl" style={{ color: 'gray' }} />
                            <h2>No tags {this.state.tagFilter.length > 0 ? "match this filter" : "found"}</h2>
                        </div>}
                    </div>
                    
                </div>
            </div>
        </GrafanaUI.Modal>
    }

}