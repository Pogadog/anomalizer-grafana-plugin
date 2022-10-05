import { PanelPlugin } from '@grafana/data';
import OptionsTypes from './types/Options';
import { Panel } from './Panel';

export const plugin = new PanelPlugin<OptionsTypes>(Panel).setPanelOptions(builder => {
  return null;
});
