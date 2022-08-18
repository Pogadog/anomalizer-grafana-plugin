import React, { Component } from 'react';
import { toDataFrame, FieldType } from '@grafana/data';
import * as GrafanaUI from '@grafana/ui';
import PlotlyAbstractionController from './PlotlyAbstractionController';
import MetricFigure from 'types/MetricFigure';
import MetricImage from 'types/MetricImage';
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';
import MetricIcon from './MetricIcon';
import DistributionIndicator from './DistributionIndicator';

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
    fields: Array<{
        name: string;
        type: FieldType;
        values: any[]
    }>
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
    tagControllerKey: string;
    tagFilterRef: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.state = {
            tagFilter: ""
        }
        this.ref = React.createRef();
        this.tagFilterTimeout = null;
        this.tagControllerKey = "tagId-controllerKey-" + uuid();
        this.tagFilterRef = React.createRef();
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
                if (point === this.tagControllerKey) {
                    continue;
                }
                if (!tagGridMap[point]) {
                    tagGridMap[point] = [];
                }
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

    componentDidUpdate = (prevProps: Props) => {
        if (this.props.image?.id !== prevProps.image?.id) {
            this.setState(update(this.state, { tagFilter: {$set: ""} }));
        }
    }

    render = () => {

        if (!this.props.figure || !this.props.image) {
            return null;
        }

        let { dataFrameBuild: tags, activeTags } = this.buildTagGrid(this.props.image.tags);

        let modalWidth = this.ref.current?.getBoundingClientRect().width ?? 200;

        return <GrafanaUI.Modal isOpen={this.props.isOpen} title="Metric Details" onDismiss={this.props.onDismiss} >
            <div ref={this.ref} style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "100%", }} >
                

                <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }} >
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', height: 400, minWidth: 100, overflow: 'scroll' }} >
                        {this.props.image.features.increasing && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} ><MetricIcon name="trendingUp" size={14} theme="secondary" />&nbsp;&nbsp;Increasing</div>}
                        {this.props.image.features.decreasing && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} ><MetricIcon name="trendingDown" size={14} theme="primary" />&nbsp;&nbsp;Decreasing</div>}
                        {this.props.image.features.hockeystick?.increasing && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} ><MetricIcon name="hockeystickIncreasing" size={14} theme="secondary" />&nbsp;&nbsp;Increasing</div>}
                        {this.props.image.features.hockeystick?.decreasing && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} ><MetricIcon name="hockeystickDecreasing" size={14} theme="primary" />&nbsp;&nbsp;Decreasing</div>}
                        
                    </div>

                    <div style={{ width: 10 }} />

                    {!this.props.figure && <img src={this.props.image?.img} style={{ width: 400, height: 400, borderRadius: 10, opacity: 0.2 }} />}

                    {!this.props.figure && <div style={{ position: 'absolute' }} >
                        <GrafanaUI.LoadingPlaceholder  />
                    </div>}

                    {this.props.figure && <div style={{ borderRadius: 10 }} ><PlotlyAbstractionController data={this.props.figure.data} layout={this.props.figure.layout} activeTags={activeTags} style={{ width: 400, height: 400, borderRadius: 10 }} /></div>}

                    <div style={{ width: 10 }} />

                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: 400, minWidth: 100, overflow: 'scroll', alignItems: 'flex-start', justifyContent: 'flex-start' }} >
                        {this.props.image.features?.distribution && Object.keys(this.props.image.features.distribution).map(tagId => {
                            if (!this.props.image?.features) {
                                return null;
                            }

                            let setTag = () => {
                                if (this.tagFilterRef.current) {
                                    let v = `"${tagId}":`;
                                    this.tagFilterRef.current.value = v;
                                    this.setState(update(this.state, { tagFilter: {$set: v} }));
                                }
                            }

                            return <div key={tagId} style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer' }} ><p style={{ marginRight: 5 }} onClick={setTag} >Tag {tagId}:</p> <DistributionIndicator style={{ position: 'relative' }} individual={this.props.image.features.distribution?.[tagId]} onClick={setTag} /></div>
                        })}
                    </div>

                </div>

                <div style={{ alignSelf: 'flex-start' }} >
                    <div style={{ height: 10 }} />
                    <h2>Tags</h2>
                    <GrafanaUI.Input ref={this.tagFilterRef} prefix={<GrafanaUI.Icon name="search" />} placeholder="Search tags (regex)" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

                        let v = e.target.value;
                        this.tagFilterTimeout && clearTimeout(this.tagFilterTimeout);

                        this.tagFilterTimeout = setTimeout(() => {
                            this.setState(update(this.state, { tagFilter: {$set: v} }));
                        }, 500);
                    }} />
                    <div style={{ height: 10 }} />
                    <div style={{ overflow: 'scroll', width:modalWidth }} >
                        {tags.fields.length > 0 && <GrafanaUI.Table width={modalWidth} height={200} data={toDataFrame(tags)} />}
                        {tags.fields.length < 1 && <div style={{ width: modalWidth, height: 200, display: 'flex', flex: 1, justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'center' }} >
                            <GrafanaUI.Icon name="question-circle" size="xxl" style={{ color: 'gray' }} />
                            <h2>No tags {this.state.tagFilter.length > 0 ? "match this filter" : "found"}</h2>
                        </div>}
                    </div>
                    <div style={{ height: 20 }} />
                    <h2>Stats:</h2>
                    <pre>{JSON.stringify(this.props.image.stats, null, 4)}</pre>
                    <div style={{ height: 10 }} />
                    <h2>Features:</h2>
                    <pre>{JSON.stringify(this.props.image.features, null, 4)}</pre>
                    <div style={{ height: 10 }} />
                    <h2>Metric ID:</h2>
                    <pre>{this.props.image.id}</pre>

                    
                </div>
            </div>
        </GrafanaUI.Modal>
    }

}
