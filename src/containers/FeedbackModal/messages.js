import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'learnerDashboard.feedbackModal.title',
    defaultMessage: 'Feedback requested',
  },
  intro: {
    id: 'learnerDashboard.feedbackModal.intro',
    defaultMessage: 'Please complete the following feedback requests.',
  },
  subject: {
    id: 'learnerDashboard.feedbackModal.subject',
    defaultMessage: 'Feedback about',
  },
  generalFeedback: {
    id: 'learnerDashboard.feedbackModal.generalFeedback',
    defaultMessage: 'General feedback',
  },
  program: {
    id: 'learnerDashboard.feedbackModal.program',
    defaultMessage: 'Program',
  },
  deadline: {
    id: 'learnerDashboard.feedbackModal.deadline',
    defaultMessage: 'Deadline',
  },
  commentPlaceholder: {
    id: 'learnerDashboard.feedbackModal.commentPlaceholder',
    defaultMessage: 'Enter your feedback',
  },
  missingAnswers: {
    id: 'learnerDashboard.feedbackModal.missingAnswers',
    defaultMessage: 'Please answer all required questions before submitting.',
  },
  deadlinePassed: {
    id: 'learnerDashboard.feedbackModal.deadlinePassed',
    defaultMessage: 'The deadline for this feedback request has passed.',
  },
  loadError: {
    id: 'learnerDashboard.feedbackModal.loadError',
    defaultMessage: 'We could not load your feedback requests. Please refresh the page and try again.',
  },
  submitError: {
    id: 'learnerDashboard.feedbackModal.submitError',
    defaultMessage: 'We could not submit this feedback. Please try again.',
  },
  submit: {
    id: 'learnerDashboard.feedbackModal.submit',
    defaultMessage: 'Submit feedback',
  },
  submitting: {
    id: 'learnerDashboard.feedbackModal.submitting',
    defaultMessage: 'Submitting...',
  },
  later: {
    id: 'learnerDashboard.feedbackModal.later',
    defaultMessage: 'Remind me later',
  },
});

export default messages;
