import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LearnerDashboardHeader from '.';

const mockedHeaderProps = jest.fn();
jest.mock('containers/MasqueradeBar', () => jest.fn(() => <div>MasqueradeBar</div>));
jest.mock('./ConfirmEmailBanner', () => jest.fn(() => <div>ConfirmEmailBanner</div>));
jest.mock('@edx/frontend-component-header', () => jest.fn((props) => {
  mockedHeaderProps(props);
  return <div>Header</div>;
}));

describe('LearnerDashboardHeader', () => {
  beforeEach(() => jest.clearAllMocks());
  it('renders shared header without learner-dashboard menu overrides', () => {
    render(<IntlProvider locale="en"><LearnerDashboardHeader /></IntlProvider>);
    expect(screen.getByText('ConfirmEmailBanner')).toBeInTheDocument();
    expect(screen.getByText('MasqueradeBar')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    const props = mockedHeaderProps.mock.calls[0][0];
    expect(props.mainMenuItems).toBeUndefined();
    expect(props.secondaryMenuItems).toBeUndefined();
    expect(props.userMenuItems).toBeUndefined();
  });
});
