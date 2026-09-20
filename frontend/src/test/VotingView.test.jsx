import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import VotingView from '../components/VotingView';

describe('VotingView Component', () => {
  const mockElection = {
    id: 'elect_2026_gen',
    title: 'General National Election 2026',
    candidates: [
      { id: 1, name: 'Dr. Amit Thakare', party: 'Blockchain Alliance', bio: 'Pioneer in Distributed Cryptography', vote_count: 5 },
      { id: 2, name: 'Prof. Warkar Mam', party: 'Decentralized Tech Party', bio: 'Specialist in High-Throughput Systems', vote_count: 5 },
    ]
  };

  it('renders candidates and live vote tallies', () => {
    const preloadedState = {
      elections: {
        currentElection: mockElection,
        selectedCandidateId: null,
      },
      voter: {
        voterSecret: '',
        voteSuccess: false,
      }
    };

    renderWithProviders(<VotingView setActiveTab={vi.fn()} />, { preloadedState });

    expect(screen.getByText(/Secret Ballot Booth/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Amit Thakare')).toBeInTheDocument();
    expect(screen.getByText('Prof. Warkar Mam')).toBeInTheDocument();
    expect(screen.getByText(/TOTAL VOTES: 10/i)).toBeInTheDocument();
  });

  it('allows candidate selection', () => {
    const preloadedState = {
      elections: {
        currentElection: mockElection,
        selectedCandidateId: null,
      },
      voter: {
        voterSecret: 'sample_secret_key_123',
        voteSuccess: false,
      }
    };

    const { store } = renderWithProviders(<VotingView setActiveTab={vi.fn()} />, { preloadedState });

    fireEvent.click(screen.getByText('Dr. Amit Thakare'));
    expect(store.getState().elections.selectedCandidateId).toBe(1);
  });

  it('displays cryptographic ballot receipt pass on vote success', () => {
    const preloadedState = {
      elections: {
        currentElection: mockElection,
        selectedCandidateId: 1,
      },
      voter: {
        voteSuccess: true,
        lastReceiptHash: '3f5a9b8c7d6e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
        voterSecret: 'sample_secret_key_123',
      }
    };

    const setActiveTab = vi.fn();
    renderWithProviders(<VotingView setActiveTab={setActiveTab} />, { preloadedState });

    expect(screen.getByText(/Cryptographic Ballot Receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/3f5a9b8c7d6e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Audit in Merkle Explorer →/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Audit in Merkle Explorer →/i }));
    expect(setActiveTab).toHaveBeenCalledWith('audit');
  });
});
