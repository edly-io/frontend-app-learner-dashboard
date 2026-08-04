import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import EmailSettingsModal from 'containers/EmailSettingsModal';
import UnenrollConfirmModal from 'containers/UnenrollConfirmModal';
import { reduxHooks } from 'hooks';
import SocialShareMenu from './SocialShareMenu';
import {
  useEmailSettings,
  useUnenrollData,
  useHandleToggleDropdown,
  useOptionVisibility,
} from './hooks';

import messages from './messages';

export const testIds = {
  unenrollModalToggle: 'unenrollModalToggle',
};

export const CourseCardMenu = ({ cardId }) => {
  const { formatMessage } = useIntl();

  const emailSettings = useEmailSettings();
  const unenrollModal = useUnenrollData();
  const handleToggleDropdown = useHandleToggleDropdown(cardId);
  const { shouldShowUnenrollItem, shouldShowDropdown, isPaidCourseMode } = useOptionVisibility(cardId);
  const { isMasquerading } = reduxHooks.useMasqueradeData();
  const { isEmailEnabled } = reduxHooks.useCardEnrollmentData(cardId);
  const isUnenrollDisabled = isMasquerading || isPaidCourseMode;

  if (!shouldShowDropdown) {
    return null;
  }

  return (
    <>
      <Dropdown onToggle={handleToggleDropdown}>
        <Dropdown.Toggle
          id={`course-actions-dropdown-${cardId}`}
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt={formatMessage(messages.dropdownAlt)}
        />
        <Dropdown.Menu>
          {shouldShowUnenrollItem && (() => {
            const unenrollItem = (
              <Dropdown.Item
                disabled={isUnenrollDisabled}
                onClick={unenrollModal.show}
                data-testid={testIds.unenrollModalToggle}
              >
                {formatMessage(messages.unenroll)}
              </Dropdown.Item>
            );
            // Paragon's `disabled` prop sets `pointer-events: none` on the item, so a
            // tooltip mounted on the item itself would never see hover events. Wrap it
            // in a plain (non-disabled) span so hover still reaches the OverlayTrigger.
            // Only shown for the paid-course reason, not while masquerading.
            if (!isPaidCourseMode) {
              return unenrollItem;
            }
            return (
              <OverlayTrigger
                placement="top"
                overlay={(
                  <Tooltip id={`unenroll-paid-course-tooltip-${cardId}`}>
                    {formatMessage(messages.unenrollPaidCourseTooltip)}
                  </Tooltip>
                )}
              >
                <span className="d-block">{unenrollItem}</span>
              </OverlayTrigger>
            );
          })()}
          <SocialShareMenu cardId={cardId} emailSettings={emailSettings} />
        </Dropdown.Menu>
      </Dropdown>
      <UnenrollConfirmModal
        show={unenrollModal.isVisible}
        closeModal={unenrollModal.hide}
        cardId={cardId}
      />
      {isEmailEnabled && (
        <EmailSettingsModal
          show={emailSettings.isVisible}
          closeModal={emailSettings.hide}
          cardId={cardId}
        />
      )}
    </>
  );
};
CourseCardMenu.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default CourseCardMenu;
