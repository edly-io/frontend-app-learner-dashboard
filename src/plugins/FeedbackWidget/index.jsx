import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Card } from '@openedx/paragon';

import FeedbackModal from 'containers/FeedbackModal';
import messages from 'plugins/LookingForChallengeWidget/messages';

import './index.scss';

export const FeedbackWidget = () => {
  const { formatMessage } = useIntl();

  return (
    <Card id="feedback-widget">
      <Card.Body>
        <h4 className="mb-3">
          {formatMessage(messages.feedbackButton)}
        </h4>
        <FeedbackModal
          renderTrigger={({ openModal, isDisabled }) => (
            <Button
              variant="outline-primary"
              className="feedback-widget-button"
              onClick={openModal}
              disabled={isDisabled}
            >
              {formatMessage(messages.feedbackButton)}
            </Button>
          )}
        />
      </Card.Body>
    </Card>
  );
};

export default FeedbackWidget;
