import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import StarRating from './StarRating';

export const FeedbackForm = ({
  questions,
  values,
  onRatingChange,
  onCommentChange,
}) => (
  <div>
    {questions.map((question) => (
      <Form.Group key={question.id} className="mb-4">
        <Form.Label className="font-weight-bold">
          {question.question}
          {question.required ? ' *' : ''}
        </Form.Label>
        {question.type === 'star_rating' ? (
          <StarRating
            value={values.ratings[question.field] || 0}
            onChange={(ratingValue) => onRatingChange(question.field, ratingValue)}
          />
        ) : (
          <Form.Control
            as="textarea"
            rows={4}
            value={values[question.field] || ''}
            onChange={(event) => onCommentChange(question.field, event.target.value)}
            placeholder="Share anything else about your learning experience."
          />
        )}
      </Form.Group>
    ))}
  </div>
);

FeedbackForm.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    required: PropTypes.bool.isRequired,
  })).isRequired,
  values: PropTypes.shape({
    ratings: PropTypes.objectOf(PropTypes.number).isRequired,
    comment: PropTypes.string,
  }).isRequired,
  onRatingChange: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func.isRequired,
};

export default FeedbackForm;
