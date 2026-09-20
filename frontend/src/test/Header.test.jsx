import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';

describe('Header Component', () => {
  it('renders brand name and segmented control tabs', () => {
    const setActiveTab = vi.fn();
    render(<Header activeTab="dashboard" setActiveTab={setActiveTab} />);

    expect(screen.getByText(/BlockVote/i)).toBeInTheDocument();
    expect(screen.getByText(/3-NODE MESH/i)).toBeInTheDocument();
    expect(screen.getByText(/Aadhaar KYC/i)).toBeInTheDocument();
    expect(screen.getByText(/Secret Ballot/i)).toBeInTheDocument();
    expect(screen.getByText(/Merkle Auditor/i)).toBeInTheDocument();
  });

  it('calls setActiveTab when a segment button is clicked', () => {
    const setActiveTab = vi.fn();
    render(<Header activeTab="dashboard" setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByText(/Secret Ballot/i));
    expect(setActiveTab).toHaveBeenCalledWith('voting');
  });
});
