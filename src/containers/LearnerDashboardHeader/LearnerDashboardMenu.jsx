import { getConfig } from '@edx/frontend-platform';

import urls from 'data/services/lms/urls';

import messages from './messages';

const normalizePath = (value) => {
  try {
    const url = new URL(value, window.location.origin);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '/';
  }
};

const isActivePath = (href) => {
  const currentPath = normalizePath(window.location.href);
  const targetPath = normalizePath(href);

  if (targetPath === '/dashboard' && currentPath.startsWith('/learner-dashboard')) {
    return true;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const getLearnerHeaderMenu = (
  formatMessage,
  courseSearchUrl,
  authenticatedUser,
  exploreCoursesClick,
) => ({
  mainMenu: [
    {
      type: 'item',
      href: getConfig().LEARNER_DASHBOARD_URL || '/',
      content: formatMessage(messages.course),
      isActive: isActivePath(getConfig().LEARNER_DASHBOARD_URL || '/dashboard'),
    },
    ...(getConfig().ENABLE_PROGRAMS ? [{
      type: 'item',
      href: `${urls.programsUrl()}`,
      content: formatMessage(messages.program),
      isActive: isActivePath(urls.programsUrl()),
    }] : []),
    ...(!getConfig().NON_BROWSABLE_COURSES ? [{
      type: 'item',
      href: `${urls.baseAppUrl(courseSearchUrl)}`,
      content: formatMessage(messages.discoverNew),
      isActive: isActivePath(urls.baseAppUrl(courseSearchUrl)),
      onClick: (e) => {
        exploreCoursesClick(e);
      },
    }] : []),
    ...(getConfig().SESSIONS_BASE_URL ? [{
      type: 'item',
      href: `${getConfig().SESSIONS_BASE_URL}`,
      content: formatMessage(messages.calendar),
      isActive: isActivePath(getConfig().SESSIONS_BASE_URL),
    }] : []),
    ...(authenticatedUser?.administrator && (getConfig().FBR_ADMIN_BASE_URL || getConfig().FBR_ADMIN_MICROFRONTEND_URL) ? [{
      type: 'item',
      href: `${getConfig().FBR_ADMIN_BASE_URL || getConfig().FBR_ADMIN_MICROFRONTEND_URL}`,
      content: formatMessage(messages.adminConsole),
      isActive: isActivePath(getConfig().FBR_ADMIN_BASE_URL || getConfig().FBR_ADMIN_MICROFRONTEND_URL),
    }] : []),
  ],
  secondaryMenu: [
    ...(getConfig().SUPPORT_URL ? [{
      type: 'item',
      href: `${getConfig().SUPPORT_URL}`,
      content: formatMessage(messages.help),
    }] : []),
  ],
  userMenu: [
    {
      heading: '',
      items: [
        {
          type: 'item',
          href: `${getConfig().ACCOUNT_PROFILE_URL}/u/${authenticatedUser?.username}`,
          content: formatMessage(messages.profile),
        },
        {
          type: 'item',
          href: `${getConfig().ACCOUNT_SETTINGS_URL}`,
          content: formatMessage(messages.account),
        },
        ...(getConfig().ORDER_HISTORY_URL ? [{
          type: 'item',
          href: getConfig().ORDER_HISTORY_URL,
          content: formatMessage(messages.orderHistory),
        }] : []),
      ],
    },
    {
      heading: '',
      items: [
        {
          type: 'item',
          href: `${getConfig().LOGOUT_URL}`,
          content: formatMessage(messages.signOut),
        },
      ],
    },
  ],
}
);

export default getLearnerHeaderMenu;
