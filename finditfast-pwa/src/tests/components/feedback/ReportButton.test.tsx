import { describe, it, expect, vi } from 'vitest';
import { ReportButton } from '../../../components/feedback/ReportButton';

describe('ReportButton', () => {
  it('ReportButton component exists and can be imported', () => {
    expect(ReportButton).toBeDefined();
    expect(typeof ReportButton).toBe('function');
  });

  it('accepts required props without errors', () => {
    const mockOnClick = vi.fn();
    expect(() => {
      ReportButton({ type: 'missing', onClick: mockOnClick });
    }).not.toThrow();
  });

  it('accepts all report types', () => {
    const mockOnClick = vi.fn();
    const types = ['missing', 'moved', 'found', 'confirm'] as const;
    
    types.forEach(type => {
      expect(() => {
        ReportButton({ type, onClick: mockOnClick });
      }).not.toThrow();
    });
  });

  it('accepts optional props', () => {
    const mockOnClick = vi.fn();
    expect(() => {
      ReportButton({ 
        type: 'missing', 
        onClick: mockOnClick, 
        disabled: true, 
        className: 'custom-class' 
      });
    }).not.toThrow();
  });
});