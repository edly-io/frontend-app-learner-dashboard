import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  message: {
    id: 'learner.dashboard.feedback.overdue.message',
    defaultMessage: 'The deadline for this feedback has passed. Submission is no longer available.',
  },
  deadline: {
    id: 'learner.dashboard.feedback.overdue.deadline',
    defaultMessage: 'Deadline',
  },
});

export const FeedbackOverdueView = ({ deadline }) => {
  const { formatMessage } = useIntl();

  return (
    <div>
      <p className="small text-muted mb-3">{formatMessage(messages.deadline)}: {deadline}</p>
      <Alert variant="warning" className="mb-0">
        {formatMessage(messages.message)}
      </Alert>
    </div>
  );
};

FeedbackOverdueView.propTypes = {
  deadline: PropTypes.string.isRequired,
};

export default FeedbackOverdueView;
