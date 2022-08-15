import { PanelPlugin } from '@grafana/data';
import { Options } from './types';
import { Panel } from './Panel';

export const plugin = new PanelPlugin<Options>(Panel).setPanelOptions(builder => {
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
