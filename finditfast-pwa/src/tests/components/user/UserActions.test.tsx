import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserActions } from '../../../components/user/UserActions';
import { usePermissions } from '../../../hooks/usePermissions';

// Mock the permissions hook
vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

// Mock the StoreRequestForm component
vi.mock('../../../components/user/StoreRequestForm', () => ({
  StoreRequestForm: ({ onSuccess, onCancel }: any) => (
    <div data-testid="store-request-form">
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

const mockUsePermissions = usePermissions as any;

describe('UserActions', () => {
  it('should not render anything for owners', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      isUser: false,
    });

    const { container } = render(<UserActions />);
    expect(container.firstChild).toBeNull();
  });

  it('should render user actions for regular users', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn((permission) => permission === 'canRequestStores'),
      isUser: true,
    });

    render(<UserActions />);

    expect(screen.getByText('Customer View')).toBeInTheDocument();
    expect(screen.getByText('Request a New Store')).toBeInTheDocument();
    expect(screen.getByText('Are you a store owner?')).toBeInTheDocument();
  });

  it('should show store request form when button is clicked', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn((permission) => permission === 'canRequestStores'),
      isUser: true,
    });

    render(<UserActions />);

    const requestButton = screen.getByText('Request a New Store');
    fireEvent.click(requestButton);

    expect(screen.getByTestId('store-request-form')).toBeInTheDocument();
  });

  it('should hide store request form on success', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn((permission) => permission === 'canRequestStores'),
      isUser: true,
    });

    render(<UserActions />);

    // Show form
    const requestButton = screen.getByText('Request a New Store');
    fireEvent.click(requestButton);

    expect(screen.getByTestId('store-request-form')).toBeInTheDocument();

    // Trigger success
    const successButton = screen.getByText('Success');
    fireEvent.click(successButton);

    expect(screen.queryByTestId('store-request-form')).not.toBeInTheDocument();
    expect(screen.getByText('Request a New Store')).toBeInTheDocument();
  });

  it('should hide store request form on cancel', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn((permission) => permission === 'canRequestStores'),
      isUser: true,
    });

    render(<UserActions />);

    // Show form
    const requestButton = screen.getByText('Request a New Store');
    fireEvent.click(requestButton);

    expect(screen.getByTestId('store-request-form')).toBeInTheDocument();

    // Trigger cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('store-request-form')).not.toBeInTheDocument();
    expect(screen.getByText('Request a New Store')).toBeInTheDocument();
  });

  it('should not show request button if user cannot request stores', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(() => false),
      isUser: true,
    });

    render(<UserActions />);

    expect(screen.getByText('Customer View')).toBeInTheDocument();
    expect(screen.queryByText('Request a New Store')).not.toBeInTheDocument();
    expect(screen.getByText('Are you a store owner?')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn(),
      isUser: true,
    });

    const { container } = render(<UserActions className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});