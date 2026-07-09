import React from 'react';

import MasqueradeBar from 'containers/MasqueradeBar';
import Header from '@edx/frontend-component-header';

import ConfirmEmailBanner from './ConfirmEmailBanner';

import './index.scss';

export const LearnerDashboardHeader = () => {
  return (
    <>
      <ConfirmEmailBanner />
      <Header />
      <MasqueradeBar />
    </>
  );
};

LearnerDashboardHeader.propTypes = {};

export default LearnerDashboardHeader;
