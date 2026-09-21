import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingView from '../components/LandingView';

describe('LandingView Component', () => {
  it('renders the hero, trust pillars, and process sections', () => {
    render(<LandingView onEnter={vi.fn()} />);

    expect(screen.getByText(/Vote the way you know/i)).toBeInTheDocument();
    expect(screen.getByText(/Built so no single point can be trusted alone/i)).toBeInTheDocument();
    expect(screen.getByText(/Three steps, the same as any polling booth/i)).toBeInTheDocument();
    expect(screen.getByText(/When one node lies, the other two catch it/i)).toBeInTheDocument();
  });

  it('calls onEnter when a "Enter the Voting Portal" CTA is clicked', () => {
    const onEnter = vi.fn();
    render(<LandingView onEnter={onEnter} />);

    fireEvent.click(screen.getAllByRole('button', { name: /Enter the Voting Portal/i })[0]);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('lets a visitor try the live EVM/VVPAT preview before entering the app', () => {
    render(<LandingView onEnter={vi.fn()} />);

    fireEvent.click(screen.getByText('Candidate A'));
    const sealButton = screen.getByRole('button', { name: /PRESS BLUE BUTTON TO VOTE/i });
    expect(sealButton).not.toBeDisabled();

    fireEvent.click(sealButton);
    expect(screen.getByText(/ILLUSTRATIVE VVPAT SLIP/i)).toBeInTheDocument();
  });
});
