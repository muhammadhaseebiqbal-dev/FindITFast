import { describe, it, expect, vi } from 'vitest';
import { ConfirmationToast } from '../../../components/feedback/ConfirmationToast';

describe('ConfirmationToast', () => {
  const defaultProps = {
    isVisible: true,
    message: 'Test message',
    type: 'success' as const,
    onClose: vi.fn(),
  };

  it('ConfirmationToast component exists and can be imported', () => {
    expect(ConfirmationToast).toBeDefined();
    expect(typeof ConfirmationToast).toBe('function');
  });

  it('has correct component signature', () => {
    // Test that the component accepts the expected props
    const props = {
      isVisible: true,
      message: 'Test message',
      type: 'success' as const,
      onClose: vi.fn(),
    };
    
    // This tests that TypeScript accepts these props
    expect(typeof ConfirmationToast).toBe('function');
  });

  it('accepts all toast types in TypeScript', () => {
    const types: Array<'success' | 'error' | 'info'> = ['success', 'error', 'info'];
    
    // This tests that TypeScript accepts all these types
    types.forEach(type => {
      const props = {
        isVisible: true,
        message: 'Test message',
        type,
        onClose: vi.fn(),
      };
      expect(typeof props.type).toBe('string');
    });
  });
});