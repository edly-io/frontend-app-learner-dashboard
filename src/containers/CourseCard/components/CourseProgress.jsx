import { reduxHooks } from 'hooks';

const CourseProgress = ({ cardId }) => {
  const { completionSummary } = reduxHooks.useCardGradeData(cardId);

  return (
    <div className="course-progress">
      <div className="progress">
        <div className="progress-bar bg-primary" style={{ width: `${completionSummary}%` } } />
      </div>
      <span className="progress-label">{completionSummary}%</span>
    </div>
  );
};

export default CourseProgress;
