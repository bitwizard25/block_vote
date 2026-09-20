import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';

describe('Header Component', () => {
  it('renders brand name and segmented control tabs with Indian election labels', () => {
    const setActiveTab = vi.fn();
    render(<Header activeTab="dashboard" setActiveTab={setActiveTab} />);

    expect(screen.getByText(/BlockVote/i)).toBeInTheDocument();
    expect(screen.getByText(/3-NODE CONSENSUS/i)).toBeInTheDocument();
    expect(screen.getByText(/Voter ID & Slip/i)).toBeInTheDocument();
    expect(screen.getByText(/EVM Voting Booth/i)).toBeInTheDocument();
    expect(screen.getByText(/VVPAT Audit/i)).toBeInTheDocument();
  });

  it('calls setActiveTab when a segment button is clicked', () => {
    const setActiveTab = vi.fn();
    render(<Header activeTab="dashboard" setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByText(/EVM Voting Booth/i));
    expect(setActiveTab).toHaveBeenCalledWith('voting');
  });
});
