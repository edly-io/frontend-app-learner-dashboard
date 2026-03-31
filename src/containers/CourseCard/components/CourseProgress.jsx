import useCourseData from '../../../hooks';

const CourseProgress = ({ cardId }) => {
  const courseData = useCourseData(cardId);
  const courseProgress = courseData?.gradeData?.completionSummary || 0;

  return (
    <>
      <style>
        {`
          .course-progress .progress .progress-bar {
            width: ${courseProgress}% !important;
          }
        `}
      </style>
      <div className="course-progress">
        <div className="progress">
          <div className="progress-bar bg-success" />
        </div>
        <span className="progress-label">{courseProgress}%</span>
      </div>
    </>
  );
};

export default CourseProgress;