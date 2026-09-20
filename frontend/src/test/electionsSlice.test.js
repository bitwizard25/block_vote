import { describe, it, expect } from 'vitest';
import electionsReducer, { selectCandidate, updateTalliesFromBlock } from '../store/slices/electionsSlice';

describe('electionsSlice', () => {
  const initialState = {
    list: [],
    currentElection: {
      id: 'test_election',
      title: 'Test Election',
      candidates: [
        { id: 1, name: 'Candidate A', vote_count: 0 },
        { id: 2, name: 'Candidate B', vote_count: 0 },
      ]
    },
    selectedCandidateId: null,
    status: 'idle',
    error: null,
  };

  it('handles selecting a candidate', () => {
    const nextState = electionsReducer(initialState, selectCandidate(2));
    expect(nextState.selectedCandidateId).toBe(2);
  });

  it('increments candidate vote tallies when a block is mined', () => {
    const mockBlock = {
      index: 1,
      transactions: [
        { election_id: 'test_election', candidate_id: 1 },
        { election_id: 'test_election', candidate_id: 1 },
        { election_id: 'test_election', candidate_id: 2 },
      ]
    };

    const nextState = electionsReducer(initialState, updateTalliesFromBlock(mockBlock));
    expect(nextState.currentElection.candidates[0].vote_count).toBe(2);
    expect(nextState.currentElection.candidates[1].vote_count).toBe(1);
  });

  it('ignores transactions for different election IDs', () => {
    const mockBlock = {
      index: 1,
      transactions: [
        { election_id: 'other_election', candidate_id: 1 },
      ]
    };

    const nextState = electionsReducer(initialState, updateTalliesFromBlock(mockBlock));
    expect(nextState.currentElection.candidates[0].vote_count).toBe(0);
  });
});
