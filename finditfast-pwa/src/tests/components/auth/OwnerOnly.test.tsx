import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OwnerOnly } from '../../../components/auth/OwnerOnly';
import { usePermissions } from '../../../hooks/usePermissions';

// Mock the permissions hook
vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

const mockUsePermissions = usePermissions as any;

describe('OwnerOnly', () => {
  it('should render children for owners', () => {
    mockUsePermissions.mockReturnValue({
      isOwner: true,
      canManageStore: vi.fn(() => true),
    });

    render(
      <OwnerOnly>
        <div>Owner content</div>
      </OwnerOnly>
    );

    expect(screen.getByText('Owner content')).toBeInTheDocument();
  });

  it('should not render children for non-owners', () => {
    mockUsePermissions.mockReturnValue({
      isOwner: false,
      canManageStore: vi.fn(() => false),
    });

    render(
      <OwnerOnly>
        <div>Owner content</div>
      </OwnerOnly>
    );

    expect(screen.queryByText('Owner content')).not.toBeInTheDocument();
  });

  it('should render fallback for non-owners', () => {
    mockUsePermissions.mockReturnValue({
      isOwner: false,
      canManageStore: vi.fn(() => false),
    });

    render(
      <OwnerOnly fallback={<div>Fallback content</div>}>
        <div>Owner content</div>
      </OwnerOnly>
    );

    expect(screen.queryByText('Owner content')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback content')).toBeInTheDocument();
  });

  it('should check store-specific permissions when storeId is provided', () => {
    const mockCanManageStore = vi.fn((storeId) => storeId === 'store123');
    
    mockUsePermissions.mockReturnValue({
      isOwner: true,
      canManageStore: mockCanManageStore,
    });

    render(
      <OwnerOnly storeId="store123">
        <div>Store content</div>
      </OwnerOnly>
    );

    expect(screen.getByText('Store content')).toBeInTheDocument();
    expect(mockCanManageStore).toHaveBeenCalledWith('store123');
  });

  it('should not render children when owner cannot manage specific store', () => {
    const mockCanManageStore = vi.fn((storeId) => storeId === 'store123');
    
    mockUsePermissions.mockReturnValue({
      isOwner: true,
      canManageStore: mockCanManageStore,
    });

    render(
      <OwnerOnly storeId="other-store" fallback={<div>No access</div>}>
        <div>Store content</div>
      </OwnerOnly>
    );

    expect(screen.queryByText('Store content')).not.toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(mockCanManageStore).toHaveBeenCalledWith('other-store');
  });

  it('should render nothing when no fallback is provided', () => {
    mockUsePermissions.mockReturnValue({
      isOwner: false,
      canManageStore: vi.fn(() => false),
    });

    const { container } = render(
      <OwnerOnly>
        <div>Owner content</div>
      </OwnerOnly>
    );

    expect(container.firstChild).toBeNull();
  });
});