import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';
import StarRating from './StarRating';

const messages = defineMessages({
  submitted: {
    id: 'learner.dashboard.feedback.submitted.label',
    defaultMessage: 'Feedback submitted',
  },
  submittedOn: {
    id: 'learner.dashboard.feedback.submitted.date',
    defaultMessage: 'Submitted on',
  },
  emptyComment: {
    id: 'learner.dashboard.feedback.submitted.comment.empty',
    defaultMessage: 'No additional feedback provided.',
  },
});

export const FeedbackSubmittedView = ({
  request,
  questions,
}) => {
  const { formatMessage } = useIntl();
  const responseAnswers = request.response?.answers || {};

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
        <Badge variant="success">{formatMessage(messages.submitted)}</Badge>
        {request.submittedAt && (
          <span className="small text-muted">
            {formatMessage(messages.submittedOn)}: {request.submittedAt}
          </span>
        )}
      </div>
      {questions.map((question) => (
        <div key={question.id} className="mb-4">
          <p className="font-weight-bold mb-2">{question.question}</p>
          {question.type === 'star_rating' ? (
            <StarRating value={responseAnswers[question.field] || 0} disabled />
          ) : (
            <p className="mb-0 text-muted">{responseAnswers[question.field] || formatMessage(messages.emptyComment)}</p>
          )}
        </div>
      ))}
    </div>
  );
};

FeedbackSubmittedView.propTypes = {
  request: PropTypes.shape({
    submittedAt: PropTypes.string,
    response: PropTypes.shape({
      answers: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ])),
    }),
  }).isRequired,
  questions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
  })).isRequired,
};

export default FeedbackSubmittedView;
