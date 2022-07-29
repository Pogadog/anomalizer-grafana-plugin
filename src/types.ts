type SeriesSize = 'sm' | 'md' | 'lg';

export interface Options {
  endpoint: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  metricType: string;
}
