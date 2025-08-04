import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserOnly } from '../../../components/auth/UserOnly';
import { usePermissions } from '../../../hooks/usePermissions';

// Mock the permissions hook
vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

const mockUsePermissions = usePermissions as any;

describe('UserOnly', () => {
  it('should render children for regular users', () => {
    mockUsePermissions.mockReturnValue({
      isUser: true,
    });

    render(
      <UserOnly>
        <div>User content</div>
      </UserOnly>
    );

    expect(screen.getByText('User content')).toBeInTheDocument();
  });

  it('should not render children for owners', () => {
    mockUsePermissions.mockReturnValue({
      isUser: false,
    });

    render(
      <UserOnly>
        <div>User content</div>
      </UserOnly>
    );

    expect(screen.queryByText('User content')).not.toBeInTheDocument();
  });

  it('should render fallback for owners', () => {
    mockUsePermissions.mockReturnValue({
      isUser: false,
    });

    render(
      <UserOnly fallback={<div>Fallback content</div>}>
        <div>User content</div>
      </UserOnly>
    );

    expect(screen.queryByText('User content')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback content')).toBeInTheDocument();
  });

  it('should render nothing when no fallback is provided', () => {
    mockUsePermissions.mockReturnValue({
      isUser: false,
    });

    const { container } = render(
      <UserOnly>
        <div>User content</div>
      </UserOnly>
    );

    expect(container.firstChild).toBeNull();
  });
});