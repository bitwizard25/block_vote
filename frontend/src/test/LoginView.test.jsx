import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import LoginView from '../components/LoginView';

describe('LoginView Component', () => {
  it('renders the Aadhaar verification form by default', () => {
    renderWithProviders(<LoginView onSuccess={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText(/Sign in to BlockVote Bharat/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('XXXX-XXXX-XXXX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ABC1234567')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Aadhaar OTP/i })).toBeInTheDocument();
  });

  it('switches to the voter secret key sign-in path', () => {
    renderWithProviders(<LoginView onSuccess={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Sign in with your Voter Secret Key/i }));
    expect(screen.getByLabelText(/Voter Secret Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
  });

  it('signs in directly with a pasted voter secret and calls onSuccess', () => {
    const onSuccess = vi.fn();
    renderWithProviders(<LoginView onSuccess={onSuccess} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Sign in with your Voter Secret Key/i }));
    fireEvent.change(screen.getByLabelText(/Voter Secret Key/i), { target: { value: 'abc123secret' } });
    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('lets a visitor continue as a guest observer without signing in', () => {
    const onSuccess = vi.fn();
    renderWithProviders(<LoginView onSuccess={onSuccess} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Continue as guest observer/i }));
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('opens the OTP modal once an OTP has been requested', () => {
    const preloadedState = {
      voter: { otpRequested: true, demoOtp: '654321', aadhaar: '8473-9281-7287', epic: 'ABC1234567', verified: false }
    };
    renderWithProviders(<LoginView onSuccess={vi.fn()} onBack={vi.fn()} />, { preloadedState });

    expect(screen.getByText(/Aadhaar Mobile OTP Verification/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify & Sign In/i })).toBeInTheDocument();
  });
});
