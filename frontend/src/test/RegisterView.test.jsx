import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import RegisterView from '../components/RegisterView';

describe('RegisterView Component', () => {
  it('renders registration form inputs and checksum information', () => {
    renderWithProviders(<RegisterView />);

    expect(screen.getByText(/Voter Registration/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('XXXX-XXXX-XXXX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ABC1234567')).toBeInTheDocument();
    expect(screen.getByText(/Verhoeff checksum algorithm/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Aadhaar OTP Challenge/i })).toBeInTheDocument();
  });

  it('renders Apple Wallet Voter Cryptographic Passport when voter is verified', () => {
    const preloadedState = {
      voter: {
        verified: true,
        mnemonic: 'apple banana cherry dragon eagle falcon garden hammer island jungle koala lemon',
        voterSecret: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        commitment: 'commit_hash_123',
        aadhaar: '8473-9281-7287',
        epic: 'ABC1234567',
        otpRequested: false,
      }
    };

    renderWithProviders(<RegisterView />, { preloadedState });

    expect(screen.getByText(/Voter Cryptographic Passport/i)).toBeInTheDocument();
    expect(screen.getByText(/apple banana cherry dragon eagle/i)).toBeInTheDocument();
    expect(screen.getByText(/ELIGIBLE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy Words/i })).toBeInTheDocument();
  });

  it('renders OTP challenge modal sheet when otpRequested is true', () => {
    const preloadedState = {
      voter: {
        otpRequested: true,
        demoOtp: '654321',
        aadhaar: '8473-9281-7287',
        epic: 'ABC1234567',
        verified: false,
      }
    };

    renderWithProviders(<RegisterView />, { preloadedState });

    expect(screen.getByText(/Aadhaar OTP Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulating secure UIDAI challenge/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify & Issue Passport/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });
});
