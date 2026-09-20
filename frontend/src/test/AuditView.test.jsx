import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import AuditView from '../components/AuditView';

describe('AuditView Component', () => {
  it('renders audit search input and description with VVPAT label', () => {
    renderWithProviders(<AuditView setActiveTab={vi.fn()} />);

    expect(screen.getByText(/VVPAT Ballot Auditor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter 64-character ballot transaction receipt hash.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify Proof/i })).toBeInTheDocument();
  });

  it('renders verified inclusion badge and Merkle tree path when proof is returned', () => {
    const preloadedState = {
      audit: {
        receiptInput: '3f5a9b8c7d6e1f2a3b4c5d6e7f8a9b0c',
        auditResult: {
          verified: true,
          block_index: 1,
          candidate_id: 1,
          merkle_root: 'merkle_root_alpha_beta',
          receipt_hash: '3f5a9b8c7d6e1f2a3b4c5d6e7f8a9b0c',
          proof: [
            { sibling_hash: 'sibling_hash_gamma', is_left: false }
          ]
        },
        isAuditing: false,
        error: null,
      },
      blockchain: {
        mempool: [],
      }
    };

    renderWithProviders(<AuditView setActiveTab={vi.fn()} />, { preloadedState });

    expect(screen.getByText(/Cryptographically Verified Inclusion/i)).toBeInTheDocument();
    expect(screen.getByText(/Merkle Inclusion DAG Path/i)).toBeInTheDocument();
    expect(screen.getByText(/Block #1 Merkle Root/i)).toBeInTheDocument();
    expect(screen.getByText('merkle_root_alpha_beta')).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Hash Sibling/i)).toBeInTheDocument();
    expect(screen.getByText('sibling_hash_gamma')).toBeInTheDocument();
    expect(screen.getByText(/Verified Ballot Receipt/i)).toBeInTheDocument();
  });
});
