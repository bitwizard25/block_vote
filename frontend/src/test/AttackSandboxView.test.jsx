import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import AttackSandboxView from '../components/AttackSandboxView';

describe('AttackSandboxView Component', () => {
  it('renders all three consensus peer nodes with synchronized status', () => {
    const preloadedState = {
      blockchain: {
        nodeStatus: {
          'Node-Alpha': { is_honest: true, tampered: false, is_valid: true, block_height: 2 },
          'Node-Beta': { is_honest: true, tampered: false, is_valid: true, block_height: 2 },
          'Node-Gamma': { is_honest: true, tampered: false, is_valid: true, block_height: 2 },
        }
      }
    };

    renderWithProviders(<AttackSandboxView />, { preloadedState });

    expect(screen.getByText(/Election Security & Anti-Tamper Verification/i)).toBeInTheDocument();
    expect(screen.getByText('Node-Alpha')).toBeInTheDocument();
    expect(screen.getByText('Node-Beta')).toBeInTheDocument();
    expect(screen.getByText('Node-Gamma')).toBeInTheDocument();
    expect(screen.getAllByText(/SYNCHRONIZED/i)).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Corrupt Node-Alpha Ledger/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consensus Auto-Heal from Majority/i })).toBeInTheDocument();
  });

  it('displays BYZANTINE CORRUPT alert status when Node-Alpha has been tampered', () => {
    const preloadedState = {
      blockchain: {
        nodeStatus: {
          'Node-Alpha': { is_honest: false, tampered: true, is_valid: false, block_height: 2 },
          'Node-Beta': { is_honest: true, tampered: false, is_valid: true, block_height: 2 },
          'Node-Gamma': { is_honest: true, tampered: false, is_valid: true, block_height: 2 },
        }
      }
    };

    renderWithProviders(<AttackSandboxView />, { preloadedState });

    expect(screen.getByText(/BYZANTINE CORRUPT/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SYNCHRONIZED/i)).toHaveLength(2);
  });
});
