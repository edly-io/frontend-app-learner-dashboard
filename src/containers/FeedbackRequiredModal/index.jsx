import React from 'react';
import { Alert, ModalDialog } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { reduxHooks } from 'hooks';
import FeedbackAccordion from './FeedbackAccordion';
import {
  getFeedbackStatus,
  getRequiredFeedbackRequests,
  mockPendingFeedbackRequests,
  submitFeedbackResponse,
} from './feedbackMocks';
import './index.scss';

const messages = defineMessages({
  title: {
    id: 'learner.dashboard.feedback.modal.title',
    defaultMessage: 'Feedback Request',
  },
  description: {
    id: 'learner.dashboard.feedback.modal.description',
    defaultMessage: 'You have pending feedback requests. Please submit them before the deadline.',
  },
  overdueDescription: {
    id: 'learner.dashboard.feedback.modal.description.overdue',
    defaultMessage: 'The deadline for this feedback has passed. You can continue using LMS.',
  },
  reminderBanner: {
    id: 'learner.dashboard.feedback.modal.banner.reminder',
    defaultMessage: 'You still have feedback requests to review. Please submit them before the deadline.',
  },
  close: {
    id: 'learner.dashboard.feedback.modal.close',
    defaultMessage: 'Close',
  },
  submittedSuccess: {
    id: 'learner.dashboard.feedback.modal.success.single',
    defaultMessage: 'Feedback submitted successfully.',
  },
  submittedRemainingSuccess: {
    id: 'learner.dashboard.feedback.modal.success.remaining',
    defaultMessage: 'Feedback submitted successfully. Please complete the remaining feedback before the deadline.',
  },
});

const buildFormValues = (request) => {
  const responseAnswers = request.response?.answers || {};

  return {
    ratings: Object.keys(responseAnswers).reduce((accumulator, field) => {
      if (typeof responseAnswers[field] === 'number') {
        return {
          ...accumulator,
          [field]: responseAnswers[field],
        };
      }

      return accumulator;
    }, {}),
    comment: responseAnswers.comment || '',
  };
};

const getDefaultOpenRequestIds = (requests) => {
  const firstPendingRequest = requests.find(request => getFeedbackStatus(request) === 'Pending');
  return firstPendingRequest ? [firstPendingRequest.id] : [];
};

export const FeedbackRequiredModal = () => {
  const { formatMessage } = useIntl();
  const allCourseData = reduxHooks.useAllCourseData();
  const [feedbackRequests, setFeedbackRequests] = React.useState(mockPendingFeedbackRequests);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(true);
  const [showReminderBanner, setShowReminderBanner] = React.useState(false);
  const [openRequestIds, setOpenRequestIds] = React.useState(
    () => getDefaultOpenRequestIds(mockPendingFeedbackRequests),
  );
  const [formValuesByRequest, setFormValuesByRequest] = React.useState(() => (
    mockPendingFeedbackRequests.reduce((acc, request) => ({
      ...acc,
      [request.id]: buildFormValues(request),
    }), {})
  ));

  const visibleRequests = React.useMemo(
    () => getRequiredFeedbackRequests(allCourseData, feedbackRequests),
    [allCourseData, feedbackRequests],
  );

  const pendingRequests = React.useMemo(
    () => visibleRequests.filter(request => getFeedbackStatus(request) === 'Pending'),
    [visibleRequests],
  );

  const overdueRequests = React.useMemo(
    () => visibleRequests.filter(request => getFeedbackStatus(request) === 'Not Submitted'),
    [visibleRequests],
  );
  const outstandingRequests = React.useMemo(
    () => visibleRequests.filter(request => getFeedbackStatus(request) !== 'Submitted'),
    [visibleRequests],
  );

  React.useEffect(() => {
    setOpenRequestIds((currentOpenRequestIds) => {
      const validOpenRequestIds = currentOpenRequestIds.filter(
        requestId => visibleRequests.some(request => request.id === requestId),
      );

      if (validOpenRequestIds.length > 0) {
        return validOpenRequestIds;
      }

      return getDefaultOpenRequestIds(visibleRequests);
    });
  }, [visibleRequests]);

  React.useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  React.useEffect(() => {
    if (pendingRequests.length > 0) {
      setIsOpen(true);
    }
  }, [pendingRequests.length]);

  React.useEffect(() => {
    if (isOpen || outstandingRequests.length === 0) {
      setShowReminderBanner(false);
    }
  }, [isOpen, outstandingRequests.length]);

  const handleRatingChange = (requestId, field, value) => {
    setFormValuesByRequest(current => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        ratings: {
          ...current[requestId]?.ratings,
          [field]: value,
        },
      },
    }));
  };

  const handleCommentChange = (requestId, field, value) => {
    setFormValuesByRequest(current => ({
      ...current,
      [requestId]: {
        ...current[requestId],
        ratings: current[requestId]?.ratings || {},
        [field]: value,
      },
    }));
  };

  const handleToggle = (requestId) => {
    setOpenRequestIds((currentOpenRequestIds) => (
      currentOpenRequestIds.includes(requestId)
        ? currentOpenRequestIds.filter(openRequestId => openRequestId !== requestId)
        : [...currentOpenRequestIds, requestId]
    ));
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    if (outstandingRequests.length > 0) {
      setShowReminderBanner(true);
    }
  };

  const handleSubmit = (requestId) => {
    const submittedRequest = feedbackRequests.find(request => request.id === requestId);
    const answers = formValuesByRequest[requestId];
    const submission = submitFeedbackResponse(requestId, answers, submittedRequest?.questions);

    const updatedRequests = feedbackRequests.map((request) => (
      request.id === requestId
        ? {
          ...request,
          feedbackSubmitted: submission.feedbackSubmitted,
          submittedAt: submission.submittedAt,
          response: submission.response,
        }
        : request
    ));

    const nextVisibleRequests = getRequiredFeedbackRequests(allCourseData, updatedRequests);
    const nextPendingRequest = nextVisibleRequests.find(request => getFeedbackStatus(request) === 'Pending');

    setFeedbackRequests(updatedRequests);
    setOpenRequestIds((currentOpenRequestIds) => {
      const nextOpenRequestIds = currentOpenRequestIds.includes(requestId)
        ? currentOpenRequestIds
        : [...currentOpenRequestIds, requestId];

      if (nextPendingRequest && !nextOpenRequestIds.includes(nextPendingRequest.id)) {
        return [...nextOpenRequestIds, nextPendingRequest.id];
      }

      return nextOpenRequestIds;
    });
    setSuccessMessage(
      nextPendingRequest
        ? formatMessage(messages.submittedRemainingSuccess)
        : formatMessage(messages.submittedSuccess),
    );
  };

  if ((visibleRequests.length === 0) || (pendingRequests.length === 0 && overdueRequests.length === 0)) {
    return null;
  }

  const headerDescription = pendingRequests.length > 0
    ? formatMessage(messages.description)
    : formatMessage(messages.overdueDescription);

  return (
    <>
      {showReminderBanner && (
        <Alert
          variant="warning"
          dismissible
          onClose={() => setShowReminderBanner(false)}
          className="mb-3"
        >
          {formatMessage(messages.reminderBanner)}
        </Alert>
      )}
      {isOpen && (
        <ModalDialog
          isOpen
          onClose={handleCloseModal}
          hasCloseButton
          isFullscreenOnMobile
          size="lg"
          title={formatMessage(messages.title)}
          isOverflowVisible={false}
        >
          <ModalDialog.Header>
            <ModalDialog.Title>{formatMessage(messages.title)}</ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            {successMessage && (
              <Alert variant="success" className="mb-3">
                {successMessage}
              </Alert>
            )}
            <p className="mb-4">{headerDescription}</p>

            <FeedbackAccordion
              requests={visibleRequests}
              openRequestIds={openRequestIds}
              onToggle={handleToggle}
              formValuesByRequest={formValuesByRequest}
              onRatingChange={handleRatingChange}
              onCommentChange={handleCommentChange}
              onSubmit={handleSubmit}
            />
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <ModalDialog.CloseButton variant="tertiary">
              {formatMessage(messages.close)}
            </ModalDialog.CloseButton>
          </ModalDialog.Footer>
        </ModalDialog>
      )}
    </>
  );
};

export default FeedbackRequiredModal;
