import React, { Component } from 'react';
import { DistributionTypes, DistributionTypesAsConst } from '../types/DistributionTypes';
import MetricImage from 'types/MetricImage';

const gaussian = require("../img/icons/gaussian.svg");
const leftTail = require("../img/icons/leftTail.svg");
const rightTail = require("../img/icons/rightTail.svg");
const biModal = require("../img/icons/biModal.svg");


type DistributionsBuild = {
    [key in DistributionTypes]?: boolean;
}

interface Props {
    style?: React.CSSProperties,
    metric?: MetricImage,
    individual?: DistributionTypes,
    onClick?: () => void
}

interface State {

}

class DistributionIndicator extends Component<Props, State> {

    render = () => {

        let testMode = false; // set to true to test all the indicators

        let distributionsBuild: DistributionsBuild = {}

        if (testMode) {
            distributionsBuild.gaussian = true;
            distributionsBuild['left-tailed'] = true;
            distributionsBuild['right-tailed'] = true;
            distributionsBuild['bi-modal'] = true;

        }

        if (this.props.metric) {
            for (let tagId in this.props.metric.features.distribution) {
                let distribution = this.props.metric.features.distribution[tagId];
    
                if (DistributionTypesAsConst.includes(distribution)) {
                    distributionsBuild[distribution] = true;
                }
            }
    
            
        } else if (this.props.individual) {
            distributionsBuild[this.props.individual] = true;
        }

        //if (Object.keys(distributionsBuild).length < 1) return null;

        return <div style={{...this.props.style}} onClick={this.props.onClick} >
            <img src={gaussian} style={{ position: 'absolute', width: 200 / 4, height: 50 / 4, opacity: distributionsBuild.gaussian ? 1 : 0.1 }} />
            <img src={leftTail} style={{ position: 'absolute', width: 200 / 4, height: 50 / 4, opacity: distributionsBuild['left-tailed'] ? 1 : 0.1 }} />
            <img src={rightTail} style={{ position: 'absolute', width: 200 / 4, height: 50 / 4, opacity: distributionsBuild['right-tailed'] ? 1 : 0.1 }} />
            <img src={biModal} style={{ position: 'absolute', width: 200 / 4, height: 50 / 4, opacity: distributionsBuild['bi-modal'] ? 1 : 0.1 }} />
        </div>;
    }

}

export default DistributionIndicator
