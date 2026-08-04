import { reduxHooks } from 'hooks';
import track from 'tracking';
import { MockUseState } from 'testUtils';

import * as hooks from './hooks';

jest.mock('hooks', () => ({
  reduxHooks: {
    useCardCertificateData: jest.fn(),
    useCardEnrollmentData: jest.fn(),
    useCardSocialSettingsData: jest.fn(),
    useTrackCourseEvent: jest.fn(),
  },
}));

const trackCourseEvent = jest.fn();
reduxHooks.useTrackCourseEvent.mockReturnValue(trackCourseEvent);
const cardId = 'test-card-id';
let out;

const state = new MockUseState(hooks);

describe('CourseCardMenu hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  describe('useUnenrollData', () => {
    beforeEach(() => {
      out = hooks.useUnenrollData();
    });
    describe('behavior', () => {
      it('initializes isUnenrollConfirmVisible state to false', () => {
        state.expectInitializedWith(state.keys.isUnenrollConfirmVisible, false);
      });
    });
    describe('output', () => {
      test('show sets state value to true', () => {
        out.show();
        expect(state.setState.isUnenrollConfirmVisible).toHaveBeenCalledWith(true);
      });
      test('hide sets state value to false', () => {
        out.hide();
        expect(state.setState.isUnenrollConfirmVisible).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('useEmailSettings', () => {
    beforeEach(() => {
      out = hooks.useEmailSettings();
    });
    describe('behavior', () => {
      it('initializes isEmailSettingsVisible state to false', () => {
        state.expectInitializedWith(state.keys.isEmailSettingsVisible, false);
      });
    });
    describe('output', () => {
      test('show sets state value to true', () => {
        out.show();
        expect(state.setState.isEmailSettingsVisible).toHaveBeenCalledWith(true);
      });
      test('hide sets state value to false', () => {
        out.hide();
        expect(state.setState.isEmailSettingsVisible).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('useHandleToggleDropdown', () => {
    beforeEach(() => { out = hooks.useHandleToggleDropdown(cardId); });
    describe('behavior', () => {
      it('initializes course event tracker with event name and card ID', () => {
        expect(reduxHooks.useTrackCourseEvent).toHaveBeenCalledWith(
          track.course.courseOptionsDropdownClicked,
          cardId,
        );
      });
    });
    describe('returned method', () => {
      it('calls trackCourseEvent iff true is passed', () => {
        out(false);
        expect(trackCourseEvent).not.toHaveBeenCalled();
        out(true);
        expect(trackCourseEvent).toHaveBeenCalled();
      });
    });
  });

  describe('useOptionVisibility', () => {
    const mockReduxHooks = (returnVals = {}) => {
      reduxHooks.useCardSocialSettingsData.mockReturnValueOnce({
        facebook: { isEnabled: !!returnVals.facebook?.isEnabled },
        twitter: { isEnabled: !!returnVals.twitter?.isEnabled },
      });
      reduxHooks.useCardEnrollmentData.mockReturnValueOnce({
        isEnrolled: !!returnVals.isEnrolled,
        isEmailEnabled: !!returnVals.isEmailEnabled,
        hasPaid: returnVals.hasPaid,
      });
      reduxHooks.useCardCertificateData.mockReturnValueOnce({
        isEarned: !!returnVals.isEarned,
      });
    };
    describe('shouldShowUnenrollItem', () => {
      it('returns true if enrolled and not earned', () => {
        mockReduxHooks({ isEnrolled: true });
        expect(hooks.useOptionVisibility(cardId).shouldShowUnenrollItem).toEqual(true);
      });
      it('returns false if not enrolled', () => {
        mockReduxHooks();
        expect(hooks.useOptionVisibility(cardId).shouldShowUnenrollItem).toEqual(false);
      });
      it('returns false if enrolled but also earned', () => {
        mockReduxHooks({ isEarned: true });
        expect(hooks.useOptionVisibility(cardId).shouldShowUnenrollItem).toEqual(false);
      });
    });

    describe('shouldShowDropdown', () => {
      it('returns false if not enrolled and both email and socials are disabled', () => {
        mockReduxHooks();
        expect(hooks.useOptionVisibility(cardId).shouldShowDropdown).toEqual(false);
      });
      it('returns false if enrolled but already earned, and both email and socials are disabled', () => {
        mockReduxHooks({ isEnrolled: true, isEarned: true });
        expect(hooks.useOptionVisibility(cardId).shouldShowDropdown).toEqual(false);
      });
      it('returns true if either social is enabled', () => {
        mockReduxHooks({ facebook: { isEnabled: true } });
        expect(hooks.useOptionVisibility(cardId).shouldShowDropdown).toEqual(true);
        mockReduxHooks({ twitter: { isEnabled: true } });
        expect(hooks.useOptionVisibility(cardId).shouldShowDropdown).toEqual(true);
      });
      it('returns true if email is enabled', () => {
        mockReduxHooks({ isEmailEnabled: true });
        expect(hooks.useOptionVisibility(cardId).shouldShowDropdown).toEqual(true);
      });
      it('returns true if enrolled and not earned', () => {
        mockReduxHooks({ isEnrolled: true });
        expect(hooks.useOptionVisibility(cardId).shouldShowDropdown).toEqual(true);
      });
    });

    describe('isPaidCourseMode', () => {
      it('returns true when the enrollment has an ecommerce order (hasPaid)', () => {
        mockReduxHooks({ hasPaid: true });
        expect(hooks.useOptionVisibility(cardId).isPaidCourseMode).toEqual(true);
      });
      it('returns false for a verified enrollment with no order (financial assistance/coupon/staff-granted)', () => {
        mockReduxHooks({ hasPaid: false });
        expect(hooks.useOptionVisibility(cardId).isPaidCourseMode).toEqual(false);
      });
      it('returns false when hasPaid is not set', () => {
        mockReduxHooks();
        expect(hooks.useOptionVisibility(cardId).isPaidCourseMode).toEqual(false);
      });
    });
  });
});
