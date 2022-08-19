type SeriesSize = 'sm' | 'md' | 'lg';

export default interface OptionsTypes {
  endpoint: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  metricType: "timeseries" | "scatter";
  refreshRate: string;
  primaryUIFilter: string;
  primaryUIFilterInvert: 'match' | 'notMatch';
  primaryServerFilter: string;
  primaryServerFilterInvert: 'match' | 'notMatch';
  secondaryUIFilter: string;
  secondaryUIFilterInvert: 'match' | 'notMatch';
  secondaryServerFilter: string;
  secondaryServerFilterInvert: 'match' | 'notMatch';
  metricWeightPreference: "alpha" | "spike" | "rstd" | "max" | "rmax" | "mean";
}
