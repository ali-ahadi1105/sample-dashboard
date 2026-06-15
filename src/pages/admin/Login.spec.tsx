import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { apiClient } from '../../lib/apiClient';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('handles login flow correctly', async () => {
    (apiClient.post as any).mockResolvedValue({ data: { access_token: 'fake-token' } });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const button = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password123',
      });
      expect(localStorage.getItem('access_token')).toBe('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
