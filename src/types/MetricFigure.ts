export default interface MetricFigure {
    data: [
        {
            hovertemplate: string,
            legendgroup: string,
            line: {
                color: string,
                dash: string
            },
            marker: {
                symbol: string
            },
            mode: string,
            name: string,
            orientation: string,
            showlegend: boolean,
            type: string,
            x: [number],
            xaxis: "x",
            y: [number],
            yaxis: "y"
        }
    ],
    layout: {
        paper_bgcolor: string
        plot_bgcolor: string
        autosize: boolean,
        font: {
            size?: number,
            color?: string
        },
        height: number,
        legend: {
            title: {
                text: string
            },
            tracegroupgap: 0
        },
        showlegend: boolean,
        template: object,
        title: {
            text: string,
            x: number,
            xanchor: string,
            font: {
                color: string
            }
        },
        width: number,
        xaxis: {
            anchor: "x" | "y",
            domain: [number],
            showgrid: boolean,
            title: {
                text: string
            }
        },
        yaxis: {
            anchor: "x" | "y",
            domain: [number],
            showgrid: boolean,
            title: {
                text: string
            }
        }
    }
}