import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import ExplorerView from '../components/ExplorerView';

describe('ExplorerView Component', () => {
  const mockBlocks = [
    {
      index: 0,
      hash: '0000genesis_hash_1234567890',
      prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      merkle_root: 'root_genesis',
      nonce: 42,
      difficulty: 2,
      timestamp: 1789898000,
      transactions: []
    },
    {
      index: 1,
      hash: '0000block1_hash_9876543210',
      prev_hash: '0000genesis_hash_1234567890',
      merkle_root: 'root_block_1',
      nonce: 108,
      difficulty: 2,
      timestamp: 1789898100,
      transactions: [
        {
          id: 'tx1',
          receipt_hash: 'receipt_123456',
          candidate_id: 1,
          nullifier: 'nullifier_1',
          election_id: 'elect_2026_gen',
          timestamp: 1789898090
        }
      ]
    }
  ];

  it('renders blocks list and count badge', () => {
    const preloadedState = {
      blockchain: {
        blocks: mockBlocks,
      }
    };

    renderWithProviders(<ExplorerView />, { preloadedState });

    expect(screen.getByText(/Public Vote Ledger & Counting/i)).toBeInTheDocument();
    expect(screen.getByText(/2 BLOCKS MINED/i)).toBeInTheDocument();
    expect(screen.getByText(/BLOCK #0 • GENESIS/i)).toBeInTheDocument();
    expect(screen.getByText(/BLOCK #1/i)).toBeInTheDocument();
  });

  it('filters blocks via search input', () => {
    const preloadedState = {
      blockchain: {
        blocks: mockBlocks,
      }
    };

    renderWithProviders(<ExplorerView />, { preloadedState });

    const searchInput = screen.getByPlaceholderText(/Search blocks by hash, index, or Merkle root.../i);
    fireEvent.change(searchInput, { target: { value: 'block1' } });

    expect(screen.getByText(/BLOCK #1/i)).toBeInTheDocument();
    expect(screen.queryByText(/BLOCK #0 • GENESIS/i)).not.toBeInTheDocument();
  });

  it('expands block details to show transactions and Merkle root', () => {
    const preloadedState = {
      blockchain: {
        blocks: mockBlocks,
      }
    };

    renderWithProviders(<ExplorerView />, { preloadedState });

    const inspectButtons = screen.getAllByText(/Inspect Block/i);
    fireEvent.click(inspectButtons[0]);

    expect(screen.getByText('root_block_1')).toBeInTheDocument();
    expect(screen.getByText(/Included Sealed Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/RECEIPT HASH: receipt_123456/i)).toBeInTheDocument();
  });
});
