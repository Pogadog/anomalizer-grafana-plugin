import { DistributionTypes } from "./DistributionTypes"

export default interface MetricImage {
    cardinality: string
    features: {
        cluster?: number,
        clusters?: string[]
        noisy?: {
            snr: number
        },
        normalized_features?: number,
        increasing?: {
            increase: number
        },
        decreasing?: {
            decrease: number
        },
        distribution?: {
            [key: string]: DistributionTypes
        },
        hockeystick: {
            increasing?: number,
            decreasing?: number
        }
    },
    weight: number,
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
