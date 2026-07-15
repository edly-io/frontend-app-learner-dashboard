import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Button,
  Form,
  ModalDialog,
} from '@openedx/paragon';

import {
  getPendingFeedbackRequests,
  submitFeedbackRequest,
} from 'data/services/lms/api';

import messages from './messages';
import './index.scss';

const sortQuestions = (questions) => [...questions].sort((left, right) => (
  (left.order ?? 0) - (right.order ?? 0)
));

const groupByFeedbackName = (requests) => requests.reduce((groups, request) => ({
  ...groups,
  [request.feedback_name]: [
    ...(groups[request.feedback_name] ?? []),
    request,
  ],
}), {});

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }

  return value;
};

const buildSubmissionAnswers = (request, requestAnswers) => sortQuestions(request.questions)
  .map((question) => {
    const value = requestAnswers?.[question.id];

    if (question.question_type === 'star_rating') {
      return value ? { question_id: question.id, star_value: Number(value) } : null;
    }

    const textValue = typeof value === 'string' ? value.trim() : '';
    return textValue ? { question_id: question.id, text_value: textValue } : null;
  })
  .filter(Boolean);

const hasMissingRequiredAnswers = (request, requestAnswers) => sortQuestions(request.questions)
  .some((question) => {
    if (!question.required) {
      return false;
    }

    const value = requestAnswers?.[question.id];
    if (question.question_type === 'star_rating') {
      return !value;
    }

    return !value?.trim();
  });

export const FeedbackModal = ({
  loadFeedbackRequests = getPendingFeedbackRequests,
  submitFeedback = submitFeedbackRequest,
  renderTrigger = null,
}) => {
  const { formatMessage } = useIntl();
  const [requests, setRequests] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});
  const [submittingRequestId, setSubmittingRequestId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadFeedbackRequests()
      .then(({ data }) => {
        if (isMounted) {
          setRequests(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        if (error?.response?.status === 403) {
          setRequests([]);
          return;
        }

        setLoadError(true);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadFeedbackRequests]);

  const groupedRequests = useMemo(() => groupByFeedbackName(requests), [requests]);

  const handleAnswerChange = (requestId, questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [requestId]: {
        ...(currentAnswers[requestId] ?? {}),
        [questionId]: value,
      },
    }));
    setValidationErrors((currentErrors) => ({ ...currentErrors, [requestId]: null }));
    setSubmitErrors((currentErrors) => ({ ...currentErrors, [requestId]: null }));
  };

  const handleSubmit = async (request) => {
    const requestAnswers = answers[request.id] ?? {};

    if (hasMissingRequiredAnswers(request, requestAnswers)) {
      setValidationErrors((currentErrors) => ({
        ...currentErrors,
        [request.id]: formatMessage(messages.missingAnswers),
      }));
      return;
    }

    setSubmittingRequestId(request.id);
    try {
      await submitFeedback({
        requestId: request.id,
        answers: buildSubmissionAnswers(request, requestAnswers),
      });
      setRequests((currentRequests) => (
        currentRequests.filter((feedbackRequest) => feedbackRequest.id !== request.id)
      ));
    } catch (error) {
      setSubmitErrors((currentErrors) => ({
        ...currentErrors,
        [request.id]: error?.response?.data?.detail ?? formatMessage(messages.submitError),
      }));
    } finally {
      setSubmittingRequestId(null);
    }
  };

  const hasVisibleContent = requests.length > 0 || loadError;
  const trigger = renderTrigger?.({
    openModal: () => setIsOpen(true),
    isDisabled: isLoaded && !hasVisibleContent,
  });

  return (
    <>
      {trigger}
      <ModalDialog
        title={formatMessage(messages.title)}
        isOpen={isOpen && hasVisibleContent}
        onClose={() => setIsOpen(false)}
        hasCloseButton
        isFullscreenOnMobile
        size="xl"
        className="feedback-modal p-4"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>{formatMessage(messages.title)}</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {loadError ? (
            <Alert variant="danger">{formatMessage(messages.loadError)}</Alert>
          ) : (
            <>
              <p>{formatMessage(messages.intro)}</p>
              {Object.entries(groupedRequests).map(([feedbackName, feedbackRequests]) => (
                <details className="feedback-request-group" key={feedbackName} open>
                  <summary className="feedback-request-summary">
                    {feedbackName}
                  </summary>
                  {feedbackRequests.map((request) => {
                  const requestAnswers = answers[request.id] ?? {};
                  const isSubmitting = submittingRequestId === request.id;
                  const deadlinePassed = request.status === 'Not Submitted';
                  const subjectName = request.subject_name
                    || request.instructor_name
                    || formatMessage(messages.generalFeedback);

                  return (
                    <div className="feedback-request-card" key={request.id}>
                      <div className="mb-3">
                        <p className="mb-1"><strong>{request.form_name}</strong></p>
                        <p className="small text-muted mb-1">
                          {formatMessage(messages.subject)}: {subjectName}
                        </p>
                        <p className="small text-muted mb-0">
                          {formatMessage(messages.deadline)}: {formatDate(request.deadline)}
                        </p>
                      </div>

                        {deadlinePassed && (
                          <Alert variant="warning">{formatMessage(messages.deadlinePassed)}</Alert>
                        )}

                        {validationErrors[request.id] && (
                          <Alert variant="danger">{validationErrors[request.id]}</Alert>
                        )}

                        {submitErrors[request.id] && (
                          <Alert variant="danger">{submitErrors[request.id]}</Alert>
                        )}

                        {sortQuestions(request.questions).map((question) => (
                          <Form.Group key={question.id} className="mb-4">
                            <Form.Label className="font-weight-bold">
                              {question.question}
                            </Form.Label>
                            {question.question_type === 'star_rating' ? (
                              <div className="feedback-rating-row" role="radiogroup" aria-label={question.question}>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <Button
                                    key={rating}
                                    type="button"
                                    variant={Number(requestAnswers[question.id]) === rating ? 'primary' : 'outline-primary'}
                                    className="feedback-rating-button"
                                    onClick={() => handleAnswerChange(request.id, question.id, rating)}
                                  >
                                    {rating}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <Form.Control
                                as="textarea"
                                rows={4}
                                value={requestAnswers[question.id] ?? ''}
                                placeholder={formatMessage(messages.commentPlaceholder)}
                                onChange={(event) => handleAnswerChange(request.id, question.id, event.target.value)}
                              />
                            )}
                          </Form.Group>
                        ))}

                        <Button
                          variant="primary"
                          onClick={() => handleSubmit(request)}
                          disabled={deadlinePassed || !!submittingRequestId}
                        >
                          {isSubmitting ? formatMessage(messages.submitting) : formatMessage(messages.submit)}
                        </Button>
                      </div>
                    );
                  })}
                </details>
              ))}
            </>
          )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="tertiary" onClick={() => setIsOpen(false)}>
              {formatMessage(messages.later)}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

FeedbackModal.propTypes = {
  loadFeedbackRequests: PropTypes.func,
  submitFeedback: PropTypes.func,
  renderTrigger: PropTypes.func,
};

export default FeedbackModal;
