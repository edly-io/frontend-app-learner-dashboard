import PropTypes from 'prop-types';

import { reduxHooks } from 'hooks';

const CourseProgress = ({ cardId }) => {
  const { completionSummary } = reduxHooks.useCardGradeData(cardId);
  const progress = Math.max(0, Math.min(Number(completionSummary) || 0, 100));

  return (
    <div className="course-progress">
      <div className="progress">
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          aria-label={`Course progress: ${progress}%`}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="progress-label">{progress}%</span>
    </div>
  );
};

CourseProgress.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseProgress;
