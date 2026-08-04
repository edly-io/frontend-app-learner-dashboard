import { when } from 'jest-when';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { reduxHooks } from 'hooks';
import * as hooks from './hooks';
import CourseCardMenu from '.';
import messages from './messages';

jest.mock('hooks', () => ({
  reduxHooks: {
    useMasqueradeData: jest.fn(),
    useCardEnrollmentData: jest.fn(),
  },
}));
jest.mock('./SocialShareMenu', () => jest.fn(() => <div>SocialShareMenu</div>));
jest.mock('containers/EmailSettingsModal', () => jest.fn(() => <div>EmailSettingsModal</div>));
jest.mock('containers/UnenrollConfirmModal', () => jest.fn(() => <div>UnenrollConfirmModal</div>));
jest.mock('./hooks', () => ({
  useEmailSettings: jest.fn(),
  useUnenrollData: jest.fn(),
  useHandleToggleDropdown: jest.fn(),
  useOptionVisibility: jest.fn(),
}));

const props = {
  cardId: 'test-card-id',
};

const emailSettings = {
  isVisible: false,
  show: jest.fn().mockName('emailSettingShow'),
  hide: jest.fn().mockName('emailSettingHide'),
};

const unenrollData = {
  isVisible: false,
  show: jest.fn().mockName('unenrollShow'),
  hide: jest.fn().mockName('unenrollHide'),
};

const mockHook = (fn, returnValue, options = {}) => {
  if (options.isCardHook) {
    when(fn).calledWith(props.cardId).mockReturnValue(returnValue);
  } else {
    when(fn).calledWith().mockReturnValue(returnValue);
  }
};

const handleToggleDropdown = jest.fn().mockName('hooks.handleToggleDropdown');

const mockHooks = (returnVals = {}) => {
  mockHook(
    hooks.useEmailSettings,
    returnVals.emailSettings ? returnVals.emailSettings : emailSettings,
  );
  mockHook(
    hooks.useUnenrollData,
    returnVals.unenrollData ? returnVals.unenrollData : unenrollData,
  );
  mockHook(hooks.useHandleToggleDropdown, handleToggleDropdown, { isCardHook: true });
  mockHook(
    hooks.useOptionVisibility,
    {
      shouldShowUnenrollItem: !!returnVals.shouldShowUnenrollItem,
      shouldShowDropdown: !!returnVals.shouldShowDropdown,
      isPaidCourseMode: !!returnVals.isPaidCourseMode,
    },
    { isCardHook: true },
  );
  mockHook(reduxHooks.useMasqueradeData, { isMasquerading: !!returnVals.isMasquerading });
  mockHook(
    reduxHooks.useCardEnrollmentData,
    { isEmailEnabled: !!returnVals.isEmailEnabled },
    { isCardHook: true },
  );
};

const renderComponent = () => render(<IntlProvider locale="en"><CourseCardMenu {...props} /></IntlProvider>);

describe('CourseCardMenu', () => {
  describe('hooks', () => {
    beforeEach(() => {
      mockHooks();
      renderComponent();
    });
    it('initializes local hooks', () => {
      when(hooks.useEmailSettings).expectCalledWith();
      when(hooks.useUnenrollData).expectCalledWith();
      when(hooks.useHandleToggleDropdown).expectCalledWith(props.cardId);
      when(hooks.useOptionVisibility).expectCalledWith(props.cardId);
    });
    it('initializes redux hook data ', () => {
      when(reduxHooks.useMasqueradeData).expectCalledWith();
      when(reduxHooks.useCardEnrollmentData).expectCalledWith(props.cardId);
    });
  });
  describe('render', () => {
    it('renders null if showDropdown is false', () => {
      mockHooks();
      renderComponent();
      const dropdown = screen.queryByRole('button', { name: messages.dropdownAlt.defaultMessage });
      expect(dropdown).toBeNull();
    });
    describe('show dropdown', () => {
      describe('hide unenroll item and disable email', () => {
        it('displays Dropdown and renders SocialShareMenu and UnenrollConfirmModal', async () => {
          mockHooks({
            shouldShowDropdown: true,
          });
          renderComponent();
          const user = userEvent.setup();
          const dropdown = screen.getByRole('button', { name: messages.dropdownAlt.defaultMessage });
          expect(dropdown).toBeInTheDocument();
          await user.click(dropdown);
          const unenrollOption = screen.queryByRole('button', { name: messages.unenroll.defaultMessage });
          expect(unenrollOption).toBeNull();
          const socialShareMenu = screen.getByText('SocialShareMenu');
          expect(socialShareMenu).toBeInTheDocument();
          const unenrollConfirmModal = screen.getByText('UnenrollConfirmModal');
          expect(unenrollConfirmModal).toBeInTheDocument();
          const emailSettingsModal = screen.queryByText('EmailSettingsModal');
          expect(emailSettingsModal).toBeNull();
        });
      });
      describe('show unenroll and enable email', () => {
        const hookProps = {
          shouldShowDropdown: true,
          isEmailEnabled: true,
          shouldShowUnenrollItem: true,
        };
        describe('unenroll modal toggle', () => {
          describe('not masquerading', () => {
            it('renders all components', async () => {
              mockHooks(hookProps);
              renderComponent();

              const user = userEvent.setup();
              const dropdown = screen.getByRole('button', { name: messages.dropdownAlt.defaultMessage });
              expect(dropdown).toBeInTheDocument();
              await user.click(dropdown);

              const unenrollOption = screen.getByRole('button', { name: messages.unenroll.defaultMessage });
              expect(unenrollOption).toBeInTheDocument();
              const socialShareMenu = screen.getByText('SocialShareMenu');
              expect(socialShareMenu).toBeInTheDocument();
              const unenrollConfirmModal = screen.getByText('UnenrollConfirmModal');
              expect(unenrollConfirmModal).toBeInTheDocument();
              const emailSettingsModal = screen.getByText('EmailSettingsModal');
              expect(emailSettingsModal).toBeInTheDocument();
            });
          });
          describe('masquerading', () => {
            it('renders but unenroll is disabled, with no paid-course tooltip', async () => {
              mockHooks({ ...hookProps, isMasquerading: true });
              renderComponent();

              const user = userEvent.setup();
              const dropdown = screen.getByRole('button', { name: messages.dropdownAlt.defaultMessage });
              expect(dropdown).toBeInTheDocument();
              await user.click(dropdown);

              const unenrollOption = screen.getByRole('button', { name: messages.unenroll.defaultMessage });
              expect(unenrollOption).toBeInTheDocument();
              expect(unenrollOption).toHaveAttribute('aria-disabled', 'true');
              const socialShareMenu = screen.getByText('SocialShareMenu');
              expect(socialShareMenu).toBeInTheDocument();
              const unenrollConfirmModal = screen.getByText('UnenrollConfirmModal');
              expect(unenrollConfirmModal).toBeInTheDocument();
              const emailSettingsModal = screen.getByText('EmailSettingsModal');
              expect(emailSettingsModal).toBeInTheDocument();

              await user.hover(unenrollOption);
              expect(
                screen.queryByText(messages.unenrollPaidCourseTooltip.defaultMessage),
              ).toBeNull();
            });
          });
          describe('paid course mode', () => {
            it('renders unenroll disabled with a tooltip on hover', async () => {
              mockHooks({ ...hookProps, isPaidCourseMode: true });
              renderComponent();

              const user = userEvent.setup();
              const dropdown = screen.getByRole('button', { name: messages.dropdownAlt.defaultMessage });
              await user.click(dropdown);

              const unenrollOption = screen.getByRole('button', { name: messages.unenroll.defaultMessage });
              expect(unenrollOption).toBeInTheDocument();
              expect(unenrollOption).toHaveAttribute('aria-disabled', 'true');

              await user.hover(unenrollOption);
              expect(
                await screen.findByText(messages.unenrollPaidCourseTooltip.defaultMessage),
              ).toBeInTheDocument();
            });
          });
          describe('free/audit course mode', () => {
            it('renders unenroll enabled with no tooltip on hover', async () => {
              mockHooks(hookProps);
              renderComponent();

              const user = userEvent.setup();
              const dropdown = screen.getByRole('button', { name: messages.dropdownAlt.defaultMessage });
              await user.click(dropdown);

              const unenrollOption = screen.getByRole('button', { name: messages.unenroll.defaultMessage });
              expect(unenrollOption).not.toHaveAttribute('aria-disabled', 'true');

              await user.hover(unenrollOption);
              expect(
                screen.queryByText(messages.unenrollPaidCourseTooltip.defaultMessage),
              ).toBeNull();
            });
          });
        });
      });
    });
  });
});
