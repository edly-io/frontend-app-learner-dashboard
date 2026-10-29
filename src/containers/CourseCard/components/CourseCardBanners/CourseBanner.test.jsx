import { render, screen } from '@testing-library/react';
import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { reduxHooks } from 'hooks';
import { formatMessage } from 'testUtils';
import { CourseBanner } from './CourseBanner';

import messages from './messages';

jest.mock('hooks', () => ({
  utilHooks: {
    useFormatDate: () => date => date,
  },
  reduxHooks: {
    useCardCourseRunData: jest.fn(),
    useCardEnrollmentData: jest.fn(),
  },
}));

const cardId = 'test-card-id';

const enrollmentData = {
  isVerified: false,
  isAuditAccessExpired: false,
  coursewareAccess: {
    hasUnmetPrerequisites: false,
    isStaff: false,
    isTooEarly: false,
  },
};
const courseRunData = {
  isActive: false,
  startDate: '11/11/3030',
  marketingUrl: 'marketing-url',
};

const renderCourseBanner = (overrides = {}) => {
  const {
    courseRun = {},
    enrollment = {},
  } = overrides;
  reduxHooks.useCardCourseRunData.mockReturnValueOnce({
    ...courseRunData,
    ...courseRun,
  });
  reduxHooks.useCardEnrollmentData.mockReturnValueOnce({
    ...enrollmentData,
    ...enrollment,
  });
  return render(<IntlProvider locale="en"><CourseBanner cardId={cardId} /></IntlProvider>);
};

describe('CourseBanner', () => {
  beforeAll(() => { mergeConfig({ SITE_NAME: 'Arbisoft' }); });
  it('initializes data with course number from enrollment, course and course run data', () => {
    renderCourseBanner();
    expect(reduxHooks.useCardCourseRunData).toHaveBeenCalledWith(cardId);
    expect(reduxHooks.useCardEnrollmentData).toHaveBeenCalledWith(cardId);
  });
  it('no display if learner is verified', () => {
    renderCourseBanner({ enrollment: { isVerified: true } });
    expect(screen.queryByRole('alert')).toBeNull();
  });
  describe('audit access expired', () => {
    it('should display correct message and link', () => {
      renderCourseBanner({ enrollment: { isAuditAccessExpired: true } });
      const auditAccessText = screen.getByText(formatMessage(messages.auditAccessExpired));
      expect(auditAccessText).toBeInTheDocument();
      const auditAccessLink = screen.getByText(formatMessage(messages.findAnotherCourse));
      expect(auditAccessLink).toBeInTheDocument();
    });
  });
  describe('subscription expired', () => {
    const subscription = {
      isSubscriptionExpired: true,
      isAuditAccessExpired: true,
      accessExpirationDate: '2026-09-01',
      subscriptionRenewUrl: 'https://rwaq.example/my-account/subscriptions/',
    };
    it('names the end date and links to renew, inside the message', () => {
      renderCourseBanner({ enrollment: { ...subscription, hadSubscription: true } });
      expect(screen.getByText(/Your Arbisoft subscription ended on 2026-09-01\./)).toBeInTheDocument();
      const link = screen.getByText(formatMessage(messages.renewSubscription));
      expect(link.closest('a')).toHaveAttribute('href', subscription.subscriptionRenewUrl);
      expect(screen.queryByText(formatMessage(messages.auditAccessExpired))).toBeNull();
    });
    it('uses a neutral message with no date when the learner never subscribed', () => {
      renderCourseBanner({ enrollment: { ...subscription, hadSubscription: false } });
      expect(screen.getByText(/This course is part of the Arbisoft subscription\./)).toBeInTheDocument();
      expect(screen.queryByText(/ended on/)).toBeNull();
      expect(screen.getByText(formatMessage(messages.subscribe)).closest('a')).toHaveAttribute(
        'href',
        subscription.subscriptionRenewUrl,
      );
    });
  });
  describe('subscription ending soon', () => {
    const ending = {
      isSubscriptionEndingSoon: true,
      isSubscriptionExpired: false,
      subscriptionEndsAt: '2026-11-01',
      subscriptionRenewUrl: 'https://rwaq.example/my-account/subscriptions/',
    };
    it('names the end date and links to renew, inside the message', () => {
      renderCourseBanner({ enrollment: ending });
      expect(screen.getByText(/Your subscription is about to end on 2026-11-01\./)).toBeInTheDocument();
      const link = screen.getByText(formatMessage(messages.renewSubscription));
      expect(link.closest('a')).toHaveAttribute('href', ending.subscriptionRenewUrl);
    });
    it('has no link without a renew url', () => {
      renderCourseBanner({ enrollment: { ...ending, subscriptionRenewUrl: null } });
      expect(screen.getByText(/Your subscription is about to end on 2026-11-01\./)).toBeInTheDocument();
      expect(screen.queryByText(formatMessage(messages.renewSubscription))).toBeNull();
    });
    it('shows nothing when the subscription is not ending', () => {
      renderCourseBanner({ enrollment: { ...ending, isSubscriptionEndingSoon: false } });
      expect(screen.queryByText(/about to end/)).toBeNull();
    });
    it('shows only the ended banner once the subscription has ended', () => {
      renderCourseBanner({
        enrollment: {
          ...ending, isSubscriptionExpired: true, hadSubscription: true, accessExpirationDate: '2026-09-01',
        },
      });
      expect(screen.queryByText(/about to end/)).toBeNull();
      expect(screen.getByText(/Your Arbisoft subscription ended on 2026-09-01\./)).toBeInTheDocument();
    });
  });
  describe('unmet prerequisites', () => {
    it('should display correct message', () => {
      renderCourseBanner({ enrollment: { coursewareAccess: { hasUnmetPrerequisites: true } } });
      const preReqText = screen.getByText(formatMessage(messages.prerequisitesNotMet));
      expect(preReqText).toBeInTheDocument();
    });
  });
  describe('too early', () => {
    describe('no start date', () => {
      it('should not display banner', () => {
        renderCourseBanner({ enrollment: { coursewareAccess: { isTooEarly: true } }, courseRun: { startDate: null } });
        const banner = screen.queryByRole('alert');
        expect(banner).toBeNull();
      });
    });
    describe('has start date', () => {
      it('should display messages courseHasNotStarted', () => {
        renderCourseBanner({ enrollment: { coursewareAccess: { isTooEarly: true } } });
        const earlyMsg = screen.getByText(
          formatMessage(messages.courseHasNotStarted, { startDate: courseRunData.startDate }),
        );
        expect(earlyMsg).toBeInTheDocument();
      });
    });
  });
  describe('staff', () => {
    it('should not display banner', () => {
      renderCourseBanner({ enrollment: { coursewareAccess: { isStaff: true } } });
      const banner = screen.queryByRole('alert');
      expect(banner).toBeNull();
    });
  });
});
