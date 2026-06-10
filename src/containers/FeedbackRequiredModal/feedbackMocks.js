const FEEDBACK_COMPLETION_THRESHOLD = 100;

export const mockFeedbackFormQuestions = [
  {
    id: 1,
    field: 'teachingQuality',
    type: 'star_rating',
    question: 'How would you rate the instructor\'s teaching quality?',
    required: true,
  },
  {
    id: 2,
    field: 'courseContent',
    type: 'star_rating',
    question: 'How would you rate the course content and learning material?',
    required: true,
  },
  {
    id: 3,
    field: 'availabilitySupport',
    type: 'star_rating',
    question: 'How would you rate the instructor\'s availability and support?',
    required: true,
  },
  {
    id: 4,
    field: 'comment',
    type: 'textarea',
    question: 'Any further feedback?',
    required: false,
  },
];

const cloneQuestions = (questions = mockFeedbackFormQuestions) => questions.map(question => ({ ...question }));

export const mockPendingFeedbackRequests = [
  {
    id: 1,
    feedbackName: 'Mid-Course Feedback',
    courseId: 'course-v1:UniversityX+CS01+2026_T1',
    courseName: 'Programming Fundamentals',
    instructor: 'Instructor A',
    trainee: 'Learner One',
    deadline: 'Jun 15, 2026',
    courseCompleted: true,
    feedbackRequired: true,
    feedbackSubmitted: false,
    submittedAt: null,
    response: null,
    questions: cloneQuestions(),
  },
  {
    id: 2,
    feedbackName: 'End of Course Feedback',
    courseId: 'course-v1:UniversityX+CS01+2026_T1',
    courseName: 'Programming Fundamentals',
    instructor: 'Instructor A',
    trainee: 'Learner One',
    deadline: 'Jun 20, 2026',
    courseCompleted: true,
    feedbackRequired: true,
    feedbackSubmitted: true,
    submittedAt: 'Jun 04, 2026 03:10 PM',
    response: {
      answers: {
        teachingQuality: 5,
        courseContent: 4,
        availabilitySupport: 5,
        comment: 'The instructor explained everything clearly.',
      },
    },
    questions: cloneQuestions(),
  },
  {
    id: 3,
    feedbackName: 'Instructor Evaluation - Week 2',
    courseId: 'course-v1:UniversityX+CS01+2026_T1',
    courseName: 'Programming Fundamentals',
    instructor: 'Instructor B',
    trainee: 'Learner One',
    deadline: 'Jun 18, 2026',
    courseCompleted: true,
    feedbackRequired: true,
    feedbackSubmitted: false,
    submittedAt: null,
    response: null,
    questions: cloneQuestions(),
  },
  {
    id: 4,
    feedbackName: 'Past Deadline Feedback',
    courseId: 'course-v1:UniversityX+CS02+2026_T1',
    courseName: 'Web Development Basics',
    instructor: 'Instructor C',
    trainee: 'Learner One',
    deadline: 'Jun 02, 2026',
    courseCompleted: true,
    feedbackRequired: true,
    feedbackSubmitted: false,
    submittedAt: null,
    response: null,
    questions: cloneQuestions(),
  },
  {
    id: 5,
    feedbackName: 'Hidden Incomplete Course Feedback',
    courseId: 'course-v1:UniversityX+CS03+2026_T1',
    courseName: 'Database Design',
    instructor: 'Instructor D',
    trainee: 'Learner One',
    deadline: 'Jun 25, 2026',
    courseCompleted: false,
    feedbackRequired: true,
    feedbackSubmitted: false,
    submittedAt: null,
    response: null,
    questions: cloneQuestions(),
  },
];

const normalizeCompletionSummary = (completionSummary) => (
  Math.max(0, Math.min(Math.round(Number(completionSummary)) || 0, FEEDBACK_COMPLETION_THRESHOLD))
);

const isCourseCompleted = (course) => normalizeCompletionSummary(course?.gradeData?.completionSummary)
  >= FEEDBACK_COMPLETION_THRESHOLD;

const parseDate = (value) => {
  const parsedDate = new Date(value);
  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
};

export const getFeedbackStatus = (request, referenceDate = new Date()) => {
  if (request.feedbackSubmitted) {
    return 'Submitted';
  }

  const deadlineDate = parseDate(request.deadline);
  const normalizedReferenceDate = new Date(referenceDate);
  normalizedReferenceDate.setHours(0, 0, 0, 0);

  return deadlineDate < normalizedReferenceDate ? 'Not Submitted' : 'Pending';
};

export const getRequiredFeedbackRequests = (courses, requests = mockPendingFeedbackRequests) => {
  const courseList = Object.values(courses || {});

  return requests.filter((request) => {
    const matchedCourse = courseList.find(
      course => course?.courseRun?.courseId === request.courseId,
    );
    const courseCompleted = matchedCourse ? isCourseCompleted(matchedCourse) : request.courseCompleted;

    return courseCompleted && request.feedbackRequired;
  });
};

export const submitFeedbackResponse = (requestId, answers, questions = mockFeedbackFormQuestions) => {
  const responseAnswers = questions.reduce((accumulator, question) => {
    if (question.type === 'star_rating') {
      return {
        ...accumulator,
        [question.field]: answers.ratings?.[question.field] || 0,
      };
    }

    return {
      ...accumulator,
      [question.field]: answers[question.field] || '',
    };
  }, {});

  return {
    requestId,
    feedbackSubmitted: true,
    submittedAt: new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    response: {
      answers: responseAnswers,
    },
  };
};
