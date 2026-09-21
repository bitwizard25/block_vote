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
              title: 'Lok Sabha General Election 2026',
              candidates: [
                { id: 1, name: 'Rajeshwar Sharma', party: 'Rashtriya Pragati Dal', bio: 'Pioneer', vote_count: 0 }
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

  it('renders the public landing page first, then transitions across all app tabs with Indian election labels', async () => {
    renderWithProviders(<App />);

    // Public landing page is the entry point
    expect(screen.getByText(/Vote the way you know/i)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Enter the Voting Portal/i })[0]);

    // Dashboard view after entering the app
    await waitFor(() => {
      expect(screen.getByText(/Lok Sabha General Election 2026/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Sealed EVM Blocks/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Observer Nodes/i)[0]).toBeInTheDocument();

    // 1. Navigate to Voter ID & Slip
    fireEvent.click(screen.getByText(/Voter ID & Slip/i));
    await waitFor(() => {
      expect(screen.getByText(/Voter Verification & Digital Slip/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('XXXX-XXXX-XXXX')).toBeInTheDocument();
    });

    // 2. Navigate to EVM Voting Booth
    fireEvent.click(screen.getByRole('button', { name: /EVM Voting Booth/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /EVM Voting Booth/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /PRESS BLUE BUTTON TO VOTE/i })).toBeInTheDocument();
    });

    // 3. Navigate to Public Vote Ledger
    fireEvent.click(screen.getByRole('button', { name: /Public Vote Ledger/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Public Vote Ledger/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search blocks by hash/i)).toBeInTheDocument();
    });

    // 4. Navigate to VVPAT Audit
    fireEvent.click(screen.getByRole('button', { name: /VVPAT Audit/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /VVPAT Ballot Auditor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify Proof/i })).toBeInTheDocument();
    });

    // 5. Navigate to Security & Integrity
    fireEvent.click(screen.getByRole('button', { name: /Security & Integrity/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Election Security/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Corrupt Node-Alpha Ledger/i })).toBeInTheDocument();
    });

    // 6. Navigate back to Election Overview
    fireEvent.click(screen.getByRole('button', { name: /Election Overview/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Lok Sabha General Election 2026/i })).toBeInTheDocument();
    });
  });
});
