import { PanelPlugin } from '@grafana/data';
import OptionsTypes from './types/Options';
import { Panel } from './Panel';

export const plugin = new PanelPlugin<OptionsTypes>(Panel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'endpoint',
      name: 'Anomalizer Endpoint',
      description: 'The endpoint of your Anomalizer endpoint to pull metrics from eg. https://engine.anomalizer.app',
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
    }).addSelect({
      name: 'Metric Sort',
      description: 'How the metrics should be sorted',
      path: 'metricWeightPreference',
      settings: {
        options: [
          { value: 'Alpha', label: 'Alpha' },
          { value: 'max', label: 'Max' },
          { value: 'rmax', label: '-Max' },
          { value: 'mean', label: 'Mean' },
          { value: 'rstd', label: 'RSTD' },
          { value: 'spike', label: 'Spike' },
          
        ],
      },
      defaultValue: 'rstd',
    }).addRadio({
      name: 'Refresh Rate',
      description: 'The rate at which the metrics should be refreshed',
      path: 'refreshRate',
      settings: {
        options: [
          { value: '10000', label: '10s' },
          { value: '30000', label: '30s' },
          { value: '60000', label: '60s' },
          { value: '120000', label: '2m' },
          { value: '300000', label: '5m' },
        ],
      },
      defaultValue: '30000',
    }).addTextInput({
      path: 'primaryUIFilter',
      name: 'Primary UI Filter',
      description: 'The primary regex search filter for the UI metrics',
      defaultValue: '',
    }).addRadio({
      name: 'Primary UI Filter Results Should...',
      path: 'primaryUIFilterInvert',
      settings: {
        options: [
          { value: 'match', label: 'Match' },
          { value: 'notMatch', label: 'Not Match' },
        ],
      },
      defaultValue: 'match',
    }).addTextInput({
      path: 'primaryServerFilter',
      name: 'Primary Server Filter',
      description: 'The primary regex search filter for the server metrics',
      defaultValue: '',
    }).addRadio({
      name: 'Primary Server Filter Results Should...',
      path: 'primaryServerFilterInvert',
      settings: {
        options: [
          { value: 'match', label: 'Match' },
          { value: 'notMatch', label: 'Not Match' },
        ],
      },
      defaultValue: 'match',
    }).addTextInput({
      path: 'secondaryUIFilter',
      name: 'Secondary UI Filter',
      description: 'The secondary regex search filter for the UI metrics',
      defaultValue: '',
    }).addRadio({
      name: 'Secondary UI Filter Results Should...',
      path: 'secondaryUIFilterInvert',
      settings: {
        options: [
          { value: 'match', label: 'Match' },
          { value: 'notMatch', label: 'Not Match' },
        ],
      },
      defaultValue: 'match',
    }).addTextInput({
      path: 'secondaryServerFilter',
      name: 'Secondary Server Filter',
      description: 'The secondary regex search filter for the server metrics',
      defaultValue: '',
    }).addRadio({
      name: 'Secondary Server Filter Results Should...',
      path: 'secondaryServerFilterInvert',
      settings: {
        options: [
          { value: 'match', label: 'Match' },
          { value: 'notMatch', label: 'Not Match' },
        ],
      },
      defaultValue: 'match',
    })
});
