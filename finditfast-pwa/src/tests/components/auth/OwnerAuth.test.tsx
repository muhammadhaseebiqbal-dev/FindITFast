import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OwnerAuth } from '../../../components/auth/OwnerAuth';
import { AuthService } from '../../../services/authService';

// Mock AuthService
vi.mock('../../../services/authService', () => ({
  AuthService: {
    registerOwner: vi.fn(),
    signInOwner: vi.fn(),
    isValidEmail: vi.fn(),
    isValidPhone: vi.fn(),
    isValidPassword: vi.fn(),
  },
}));

describe('OwnerAuth', () => {
  const mockOnAuthSuccess = vi.fn();
  const mockOnAuthError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default validation mocks
    vi.mocked(AuthService.isValidEmail).mockReturnValue(true);
    vi.mocked(AuthService.isValidPhone).mockReturnValue(true);
    vi.mocked(AuthService.isValidPassword).mockReturnValue(true);
  });

  describe('Registration Form', () => {
    it('should render registration form by default', () => {
      render(<OwnerAuth />);
      
      expect(screen.getByText('Store Owner Registration')).toBeInTheDocument();
      expect(screen.getByLabelText(/Your Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Store Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByLabelText('Password *')).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account/ })).toBeInTheDocument();
    });

    it('should validate required fields on registration', async () => {
      render(<OwnerAuth />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Store name is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      vi.mocked(AuthService.isValidEmail).mockReturnValue(false);
      
      render(<OwnerAuth />);
      
      const emailInput = screen.getByLabelText(/Email Address/);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should validate phone format', async () => {
      vi.mocked(AuthService.isValidPhone).mockReturnValue(false);
      
      render(<OwnerAuth />);
      
      const phoneInput = screen.getByLabelText(/Phone Number/);
      fireEvent.change(phoneInput, { target: { value: '123' } });
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      render(<OwnerAuth />);
      
      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/Your Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Store Name/), { target: { value: 'Test Store' } });
      fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'different' } });
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should call registerOwner on successful registration', async () => {
      vi.mocked(AuthService.registerOwner).mockResolvedValue({} as any);
      
      render(<OwnerAuth onAuthSuccess={mockOnAuthSuccess} />);
      
      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/Your Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Store Name/), { target: { value: 'Test Store' } });
      fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AuthService.registerOwner).toHaveBeenCalledWith(
          {
            name: 'John Doe',
            storeName: 'Test Store',
            email: 'test@example.com',
            phone: '1234567890',
          },
          'password123'
        );
        expect(mockOnAuthSuccess).toHaveBeenCalled();
      });
    });

    it('should handle registration errors', async () => {
      const mockError = { code: 'auth/email-already-in-use', message: 'Email already exists' };
      vi.mocked(AuthService.registerOwner).mockRejectedValue(mockError);
      
      render(<OwnerAuth onAuthError={mockOnAuthError} />);
      
      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/Your Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Store Name/), { target: { value: 'Test Store' } });
      fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
        expect(mockOnAuthError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('Login Form', () => {
    it('should switch to login form when toggle is clicked', () => {
      render(<OwnerAuth />);
      
      const toggleButton = screen.getByText(/Already have an account/);
      fireEvent.click(toggleButton);

      expect(screen.getByText('Store Owner Login')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Your Name/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Store Name/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Phone Number/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Confirm Password/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/ })).toBeInTheDocument();
    });

    it('should validate required fields on login', async () => {
      render(<OwnerAuth />);
      
      // Switch to login mode
      const toggleButton = screen.getByText(/Already have an account/);
      fireEvent.click(toggleButton);
      
      const submitButton = screen.getByRole('button', { name: /Sign In/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should call signInOwner on successful login', async () => {
      vi.mocked(AuthService.signInOwner).mockResolvedValue({} as any);
      
      render(<OwnerAuth onAuthSuccess={mockOnAuthSuccess} />);
      
      // Switch to login mode
      const toggleButton = screen.getByText(/Already have an account/);
      fireEvent.click(toggleButton);
      
      // Fill in login fields
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Sign In/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AuthService.signInOwner).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockOnAuthSuccess).toHaveBeenCalled();
      });
    });

    it('should handle login errors', async () => {
      const mockError = { code: 'auth/wrong-password', message: 'Wrong password' };
      vi.mocked(AuthService.signInOwner).mockRejectedValue(mockError);
      
      render(<OwnerAuth onAuthError={mockOnAuthError} />);
      
      // Switch to login mode
      const toggleButton = screen.getByText(/Already have an account/);
      fireEvent.click(toggleButton);
      
      // Fill in login fields
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'wrongpassword' } });
      
      const submitButton = screen.getByRole('button', { name: /Sign In/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Wrong password')).toBeInTheDocument();
        expect(mockOnAuthError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during registration', async () => {
      vi.mocked(AuthService.registerOwner).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<OwnerAuth />);
      
      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/Your Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Store Name/), { target: { value: 'Test Store' } });
      fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Create Account/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Creating Account.../)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show loading state during login', async () => {
      vi.mocked(AuthService.signInOwner).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<OwnerAuth />);
      
      // Switch to login mode
      const toggleButton = screen.getByText(/Already have an account/);
      fireEvent.click(toggleButton);
      
      // Fill in login fields
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Sign In/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Signing In.../)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Form Reset', () => {
    it('should clear form when switching between login and registration', () => {
      render(<OwnerAuth />);
      
      // Fill in registration form
      fireEvent.change(screen.getByLabelText(/Your Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'test@example.com' } });
      
      // Switch to login
      const toggleButton = screen.getByText(/Already have an account/);
      fireEvent.click(toggleButton);
      
      // Switch back to registration
      const backToggleButton = screen.getByText(/Don't have an account/);
      fireEvent.click(backToggleButton);
      
      // Form should be cleared
      expect((screen.getByLabelText(/Your Name/) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/Email Address/) as HTMLInputElement).value).toBe('');
    });
  });
});