import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import RegisterView from '../components/RegisterView';

describe('RegisterView Component ("My Voter Slip")', () => {
  it('prompts a guest observer to sign in when no voter slip exists yet', () => {
    renderWithProviders(<RegisterView setActiveTab={vi.fn()} />);

    expect(screen.getByText(/No voter slip on this session yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('routes a guest to the login page', () => {
    const setActiveTab = vi.fn();
    renderWithProviders(<RegisterView setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(setActiveTab).toHaveBeenCalledWith('login');
  });

  it('renders the Official Digital Voter Slip when the voter is verified', () => {
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

    renderWithProviders(<RegisterView setActiveTab={vi.fn()} />, { preloadedState });

    expect(screen.getByText(/Official Digital Voter Slip/i)).toBeInTheDocument();
    expect(screen.getByText(/apple banana cherry dragon eagle/i)).toBeInTheDocument();
    expect(screen.getByText(/VERIFIED VOTER/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy Words/i })).toBeInTheDocument();
  });

  it('logs out and returns to the login page', () => {
    const setActiveTab = vi.fn();
    const preloadedState = {
      voter: {
        verified: true,
        mnemonic: 'apple banana cherry dragon eagle falcon garden hammer island jungle koala lemon',
        voterSecret: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        epic: 'ABC1234567',
      }
    };

    renderWithProviders(<RegisterView setActiveTab={setActiveTab} />, { preloadedState });

    fireEvent.click(screen.getByRole('button', { name: /Log out of this session/i }));
    expect(setActiveTab).toHaveBeenCalledWith('login');
  });
});
