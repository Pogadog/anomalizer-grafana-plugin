import React, { Component } from 'react';
import Theme from 'values/Theme';

type IconNames =  "trendingUp" | "trendingDown";

interface IconImports {
    default: {
        [key in IconNames]: {
            primary: any,
            secondary: any
        }
    }
}

const Icons: IconImports = {
    default: {
        trendingUp: {
            primary: require("../img/trendingUp.primary.svg"),
            secondary: require("../img/trendingUp.secondary.svg")
        },
        trendingDown: {
            primary: require("../img/trendingDown.primary.svg"),
            secondary: require("../img/trendingDown.secondary.svg")
        },
    }
    
}

const BackgroundColors = {
    primary: Theme.colors.palette.primary,
    secondary: Theme.colors.palette.secondary
}

interface Props {
    name: IconNames,
    size: number,
    style?: React.CSSProperties,
    theme: 'secondary' | 'primary'
}

interface State {

}

class MetricIcon extends Component<Props, State> {

    render = () => {
        return <div style={{...this.props.style, padding: 5, borderRadius: 90, backgroundColor: BackgroundColors[this.props.theme], display: 'flex', alignItems: 'center' }} >
            <img src={Icons.default[this.props.name][this.props.theme]} style={{ width: this.props.size, height: this.props.size }} />
        </div>;
    }

}

export default MetricIcon
