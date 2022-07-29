import { PanelPlugin } from '@grafana/data';
import { Options } from './types';
import { Panel } from './Panel';

export const plugin = new PanelPlugin<Options>(Panel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'endpoint',
      name: 'Anomalizer Endpoint',
      description: 'The endpoint of your Anomalizer endpoint to pull metrics from',
      defaultValue: 'https://engine.anomalizer.app',
    }).addRadio({
      name: 'Metric Type',
      description: 'The type of Metric to be displayed',
      path: 'metricType',
      settings: {
        options: [
          { value: 'timeseries', label: 'Time Series' },
          { value: 'scatter', label: 'Scatter' },
        ],
      },
      defaultValue: 'timeseries',
    })
});
