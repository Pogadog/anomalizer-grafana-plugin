import React from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import Main from './components/Main';
//import { css, cx } from 'emotion';
//import * as UI from '@grafana/ui';

export const Panel: React.FC<PanelProps<Options>> = props => {
  return <Main {...props} />;
};

