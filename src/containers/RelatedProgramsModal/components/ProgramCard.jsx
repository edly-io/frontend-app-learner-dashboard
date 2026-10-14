import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
  // Hyperlink,
} from '@openedx/paragon';

import messages from './messages';
import './index.scss';

export const whiteFontWrapper = (node) => (<span className="text-white">{node}</span>);

export const ProgramCard = ({ data }) => {
  const { formatMessage } = useIntl();
  const numCoursesMessage = formatMessage(
    messages.courses,
    { numCourses: data.numberOfCourses },
  );
  return (
    <Card
      className="program-card mx-auto bg-primary-500 text-white mb-3.5 pb-3.5"
      style={{ width: '18rem', color: 'white' }}
      as="a"
      href={data.programUrl}
      isClickable
    >
      <Card.ImageCap
        className="program-card-banner"
        src={data.bannerImgSrc}
        srcAlt={formatMessage(messages.bannerAlt)}
        logoSrc={data.logoImgSrc}
        logoAlt={formatMessage(messages.logoAlt, { provider: data.provider })}
      />
      <Card.Header
        title={whiteFontWrapper(data.title)}
        subtitle={whiteFontWrapper(data.provider)}
      />
      <div className="ml-4">
        <div className="program-summary mt-2">
          {numCoursesMessage}
        </div>
      </div>
    </Card>
  );
};
ProgramCard.propTypes = {
  data: PropTypes.shape({
    bannerImgSrc: PropTypes.string,
    logoImgSrc: PropTypes.string,
    numberOfCourses: PropTypes.number,
    programUrl: PropTypes.string,
    provider: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
};

export default ProgramCard;
