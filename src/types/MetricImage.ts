export default interface MetricImage {
    cardinality: string
    features: {
        [key: string]: number | string
    }
    id: string
    img: string
    metric: string
    plot: "timeseries" | "scatter"
    prometheus: string
    stats: {
        [key: string]: number
    }
    status: "normal" | "warning" | "critical"
    tags: {
        [key: string]: string
    }[]
    type: string
}
