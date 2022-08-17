import React, { Component } from 'react';
import { DistributionTypes, DistributionTypesAsConst } from '../types/DistributionTypes';
import MetricImage from 'types/MetricImage';

const gaussian = require("../img/icons/gaussian.svg");
const leftTail = require("../img/icons/leftTail.svg");


const rightTail = require("../img/icons/rightTail.svg");

type DistributionsBuild = {
    [key in DistributionTypes]?: boolean;
}

interface Props {
    style?: React.CSSProperties,
    metric: MetricImage
}

interface State {

}

class DistributionIndicator extends Component<Props, State> {

    render = () => {

        let distributionsBuild: DistributionsBuild = {}

        for (let tagId in this.props.metric.features.distribution) {
            let distribution = this.props.metric.features.distribution[tagId];

            if (DistributionTypesAsConst.includes(distribution)) {
                distributionsBuild[distribution] = true;
            }
        }

        if (Object.keys(distributionsBuild).length < 1) return null;

        return <div >
            <img src={gaussian} style={{ ...this.props.style, width: 200 / 4, height: 50 / 4, opacity: distributionsBuild.gaussian ? 1 : 0.1 }} />
            <img src={leftTail} style={{ ...this.props.style, width: 200 / 4, height: 50 / 4, opacity: distributionsBuild['left-tail'] ? 1 : 0.1 }} />
            <img src={rightTail} style={{ ...this.props.style, width: 200 / 4, height: 50 / 4, opacity: distributionsBuild['right-tail'] ? 1 : 0.1 }} />
        </div>;
    }

}

export default DistributionIndicator
