import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import FeedbackWidget from 'plugins/FeedbackWidget';
import LookingForChallengeWidget from 'plugins/LookingForChallengeWidget';

// eslint-disable-next-line arrow-body-style
export const WidgetSidebarSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.learner_dashboard.widget_sidebar.v1"
    idAliases={['widget_sidebar_slot']}
  >
    <>
      <LookingForChallengeWidget />
      <FeedbackWidget />
    </>
  </PluginSlot>
);

export default WidgetSidebarSlot;
