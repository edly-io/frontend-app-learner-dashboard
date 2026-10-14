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
        canUnenroll: returnVals.canUnenroll !== false,
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

    describe('isUnenrollBlocked', () => {
      it('returns true if enrolled and not earned but the backend says the learner cannot unenroll', () => {
        mockReduxHooks({ isEnrolled: true, canUnenroll: false });
        const visibility = hooks.useOptionVisibility(cardId);
        expect(visibility.shouldShowUnenrollItem).toEqual(true);
        expect(visibility.isUnenrollBlocked).toEqual(true);
      });
      it('returns false if the learner can unenroll', () => {
        mockReduxHooks({ isEnrolled: true });
        expect(hooks.useOptionVisibility(cardId).isUnenrollBlocked).toEqual(false);
      });
      it('returns false if there is no unenroll item to block', () => {
        mockReduxHooks({ canUnenroll: false });
        expect(hooks.useOptionVisibility(cardId).isUnenrollBlocked).toEqual(false);
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
  });
});
