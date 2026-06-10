import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Badge,
  Button,
  Card,
} from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import FeedbackForm from './FeedbackForm';
import FeedbackOverdueView from './FeedbackOverdueView';
import FeedbackSubmittedView from './FeedbackSubmittedView';
import { getFeedbackStatus } from './feedbackMocks';

const messages = defineMessages({
  deadline: {
    id: 'learner.dashboard.feedback.accordion.deadline',
    defaultMessage: 'Deadline',
  },
  pending: {
    id: 'learner.dashboard.feedback.accordion.pending',
    defaultMessage: 'Pending',
  },
  submitted: {
    id: 'learner.dashboard.feedback.accordion.submitted',
    defaultMessage: 'Submitted',
  },
  overdue: {
    id: 'learner.dashboard.feedback.accordion.overdue',
    defaultMessage: 'Not Submitted',
  },
  submit: {
    id: 'learner.dashboard.feedback.accordion.submit',
    defaultMessage: 'Submit Feedback',
  },
});

const getBadgeVariant = (status) => {
  if (status === 'Submitted') {
    return 'success';
  }

  if (status === 'Not Submitted') {
    return 'danger';
  }

  return 'warning';
};

const getStatusLabel = (status, formatMessage) => {
  if (status === 'Submitted') {
    return formatMessage(messages.submitted);
  }

  if (status === 'Not Submitted') {
    return formatMessage(messages.overdue);
  }

  return formatMessage(messages.pending);
};

export const FeedbackAccordion = ({
  requests,
  openRequestIds,
  onToggle,
  formValuesByRequest,
  onRatingChange,
  onCommentChange,
  onSubmit,
}) => {
  const { formatMessage } = useIntl();

  return (
    <div className="feedback-accordion">
      {requests.map((request) => {
        const isExpanded = openRequestIds.includes(request.id);
        const status = getFeedbackStatus(request);
        const isSubmitted = status === 'Submitted';
        const isOverdue = status === 'Not Submitted';
        const requestQuestions = request.questions || [];
        const requiredQuestions = requestQuestions.filter(question => question.required);
        const requestFormValues = formValuesByRequest[request.id] || {
          ratings: {},
          comment: '',
        };
        const isSubmitDisabled = requiredQuestions.some((question) => {
          if (question.type === 'star_rating') {
            return !requestFormValues.ratings[question.field];
          }

          return !String(requestFormValues[question.field] || '').trim();
        });
        let sectionContent;

        if (isSubmitted) {
          sectionContent = <FeedbackSubmittedView request={request} questions={requestQuestions} />;
        } else if (isOverdue) {
          sectionContent = <FeedbackOverdueView deadline={request.deadline} />;
        } else {
          sectionContent = (
            <>
              <FeedbackForm
                questions={requestQuestions}
                values={requestFormValues}
                onRatingChange={(field, value) => onRatingChange(request.id, field, value)}
                onCommentChange={(field, value) => onCommentChange(request.id, field, value)}
              />
              <Button onClick={() => onSubmit(request.id)} disabled={isSubmitDisabled}>
                {formatMessage(messages.submit)}
              </Button>
            </>
          );
        }

        return (
          <Card key={request.id} className="mb-3">
            <button
              type="button"
              className={classNames('feedback-accordion-toggle', { expanded: isExpanded })}
              onClick={() => onToggle(request.id)}
            >
              <div className="feedback-accordion-toggle-content">
                <div className="feedback-accordion-copy">
                  <p className="mb-1 font-weight-bold">{request.feedbackName}</p>
                  <p className="mb-1 small text-muted">{request.courseName}</p>
                  <p className="mb-0 small text-muted">{request.instructor}</p>
                </div>
                <div className="d-flex align-items-center flex-wrap justify-content-end">
                  <span className="small text-muted mr-3">
                    {formatMessage(messages.deadline)}: {request.deadline}
                  </span>
                  <Badge variant={getBadgeVariant(status)} className="mr-3">
                    {getStatusLabel(status, formatMessage)}
                  </Badge>
                  <span className="feedback-accordion-chevron" aria-hidden="true">
                    {isExpanded ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
              </div>
            </button>
            {isExpanded && (
              <Card.Section>
                {sectionContent}
              </Card.Section>
            )}
          </Card>
        );
      })}
    </div>
  );
};

FeedbackAccordion.propTypes = {
  requests: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    feedbackName: PropTypes.string.isRequired,
    instructor: PropTypes.string.isRequired,
    courseName: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    feedbackSubmitted: PropTypes.bool.isRequired,
    questions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      field: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      required: PropTypes.bool.isRequired,
    })).isRequired,
  })).isRequired,
  openRequestIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onToggle: PropTypes.func.isRequired,
  formValuesByRequest: PropTypes.objectOf(PropTypes.shape({
    ratings: PropTypes.objectOf(PropTypes.number).isRequired,
    comment: PropTypes.string,
  })).isRequired,
  onRatingChange: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default FeedbackAccordion;
