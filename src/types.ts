type SeriesSize = 'sm' | 'md' | 'lg';

export interface Options {
  endpoint: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  metricType: string;
  refreshRate: string;
  primaryUIFilter: string;
  primaryUIFilterInvert: 'match' | 'notMatch';
  primaryServerFilter: string;
  primaryServerFilterInvert: 'match' | 'notMatch';
  secondaryUIFilter: string;
  secondaryUIFilterInvert: 'match' | 'notMatch';
  secondaryServerFilter: string;
  secondaryServerFilterInvert: 'match' | 'notMatch';
}
