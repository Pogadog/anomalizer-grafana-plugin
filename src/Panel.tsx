import React from 'react';
import { PanelProps } from '@grafana/data';
import OptionsTypes from 'types/Options';
import Main from './components/Main';

export const Panel: React.FC<PanelProps<OptionsTypes>> = props => {
  return <Main {...props} />;
};

