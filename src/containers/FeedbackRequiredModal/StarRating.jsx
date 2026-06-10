import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const StarRating = ({
  value,
  onChange,
  disabled,
}) => (
  <div className="feedback-star-rating" role="radiogroup" aria-disabled={disabled}>
    {[1, 2, 3, 4, 5].map((starValue) => (
      <button
        key={starValue}
        type="button"
        className={classNames('feedback-star-button', {
          selected: starValue <= value,
        })}
        onClick={() => !disabled && onChange(starValue)}
        disabled={disabled}
        aria-label={`${starValue} out of 5 stars`}
        aria-checked={starValue === value}
        role="radio"
      >
        {starValue <= value ? '\u2605' : '\u2606'}
      </button>
    ))}
  </div>
);

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

StarRating.defaultProps = {
  value: 0,
  onChange: () => {},
  disabled: false,
};

export default StarRating;
