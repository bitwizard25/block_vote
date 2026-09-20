import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import App from '../App';

describe('App E2E Tab Flow & Navigation', () => {
  beforeEach(() => {
    // Mock global fetch for initial App mount calls
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/elections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'elect_2026_gen',
              title: 'General National Election 2026',
              candidates: [
                { id: 1, name: 'Dr. Amit Thakare', party: 'Blockchain Alliance', bio: 'Pioneer', vote_count: 0 }
              ]
            }
          ])
        });
      }
      if (url === '/api/blocks') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { index: 0, hash: '0000genesis', prev_hash: '', merkle_root: 'root0', transactions: [] }
          ])
        });
      }
      if (url === '/api/mempool') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      if (url === '/api/node-status') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'Node-Alpha': { is_honest: true, tampered: false, is_valid: true, block_height: 1 }
          })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('renders Dashboard initially and smoothly transitions across all tabs', async () => {
    renderWithProviders(<App />);

    // Initial Dashboard view
    expect(screen.getByText(/Decentralized Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Block Height/i)).toBeInTheDocument();
    expect(screen.getByText(/Consensus Peers/i)).toBeInTheDocument();

    // 1. Navigate to Aadhaar KYC
    fireEvent.click(screen.getByText(/Aadhaar KYC/i));
    await waitFor(() => {
      expect(screen.getByText(/Voter Registration/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('XXXX-XXXX-XXXX')).toBeInTheDocument();
    });

    // 2. Navigate to Secret Ballot
    fireEvent.click(screen.getByText(/Secret Ballot/i));
    await waitFor(() => {
      expect(screen.getByText(/Secret Ballot Booth/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cast Anonymous Ballot/i })).toBeInTheDocument();
    });

    // 3. Navigate to Block Explorer
    fireEvent.click(screen.getByText(/Block Explorer/i));
    await waitFor(() => {
      expect(screen.getByText(/Ledger Block Explorer/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search blocks by hash/i)).toBeInTheDocument();
    });

    // 4. Navigate to Merkle Auditor
    fireEvent.click(screen.getByText(/Merkle Auditor/i));
    await waitFor(() => {
      expect(screen.getByText(/Cryptographic Merkle Auditor/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify Proof/i })).toBeInTheDocument();
    });

    // 5. Navigate to Attack Sandbox
    fireEvent.click(screen.getByText(/Attack Sandbox/i));
    await waitFor(() => {
      expect(screen.getByText(/Consensus Attack & Resilience Sandbox/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Corrupt Node-Alpha Ledger/i })).toBeInTheDocument();
    });

    // 6. Navigate back to Dashboard
    fireEvent.click(screen.getByText(/Dashboard/i));
    await waitFor(() => {
      expect(screen.getByText(/Decentralized Governance/i)).toBeInTheDocument();
    });
  });
});
