import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import FeedbackModal from '.';

const feedbackRequest = {
  id: 42,
  feedback_name: 'Mid-Course Feedback',
  form_name: 'Weekly Instructor Feedback',
  questions: [
    {
      id: 7,
      question: 'Rate the instructor',
      question_type: 'star_rating',
      required: true,
      is_default: true,
      order: 0,
    },
    {
      id: 8,
      question: 'Any comments?',
      question_type: 'textarea',
      required: false,
      is_default: true,
      order: 1,
    },
  ],
  subject_name: 'Ahmad Ali',
  program_name: 'STP Batch 2026',
  deadline: '2026-07-15',
  status: 'Pending',
};

const renderFeedbackModal = (props = {}) => render(
  <IntlProvider locale="en">
    <FeedbackModal
      loadFeedbackRequests={jest.fn().mockResolvedValue({ data: [feedbackRequest] })}
      submitFeedback={jest.fn().mockResolvedValue({ data: { detail: 'ok' } })}
      {...props}
    />
  </IntlProvider>,
);

describe('FeedbackModal', () => {
  it('loads and renders pending feedback requests', async () => {
    renderFeedbackModal();

    expect(await screen.findByText('Mid-Course Feedback')).toBeInTheDocument();
    expect(screen.getByText('Rate the instructor')).toBeInTheDocument();
    expect(screen.getByText(/Feedback about: Ahmad Ali/)).toBeInTheDocument();
  });

  it('validates required answers before submitting', async () => {
    const submitFeedback = jest.fn();
    renderFeedbackModal({ submitFeedback });

    fireEvent.click(await screen.findByRole('button', { name: 'Submit feedback' }));

    expect(await screen.findByText('Please answer all required questions before submitting.')).toBeInTheDocument();
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('submits answers and removes the request from the modal', async () => {
    const submitFeedback = jest.fn().mockResolvedValue({ data: { detail: 'ok' } });
    renderFeedbackModal({ submitFeedback });

    fireEvent.click(await screen.findByRole('button', { name: '4' }));
    fireEvent.change(screen.getByPlaceholderText('Enter your feedback'), {
      target: { value: 'Clear explanations.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));

    await waitFor(() => expect(submitFeedback).toHaveBeenCalledWith({
      requestId: 42,
      answers: [
        { question_id: 7, star_value: 4 },
        { question_id: 8, text_value: 'Clear explanations.' },
      ],
    }));
    await waitFor(() => expect(screen.queryByText('Mid-Course Feedback')).not.toBeInTheDocument());
  });

  it('does not show feedback modal for non-trainee 403 responses', async () => {
    renderFeedbackModal({
      loadFeedbackRequests: jest.fn().mockRejectedValue({ response: { status: 403 } }),
    });

    await waitFor(() => expect(screen.queryByText('Feedback requested')).not.toBeInTheDocument());
  });
});
