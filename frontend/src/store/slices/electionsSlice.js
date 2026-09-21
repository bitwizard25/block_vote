import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiUrl } from '../../apiConfig';

export const fetchElections = createAsyncThunk('elections/fetchElections', async () => {
  const res = await fetch(apiUrl('/api/elections'));
  if (!res.ok) throw new Error('Failed to fetch elections');
  return await res.json();
});

const electionsSlice = createSlice({
  name: 'elections',
  initialState: {
    list: [],
    currentElection: null,
    selectedCandidateId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectCandidate: (state, action) => {
      state.selectedCandidateId = action.payload;
    },
    updateTalliesFromBlock: (state, action) => {
      const block = action.payload;
      if (!block.transactions || !state.currentElection) return;
      block.transactions.forEach(tx => {
        if (tx.election_id === state.currentElection.id) {
          const cand = state.currentElection.candidates.find(c => c.id === tx.candidate_id);
          if (cand) cand.vote_count++;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchElections.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchElections.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        if (action.payload.length > 0 && !state.currentElection) {
          state.currentElection = action.payload[0];
        } else if (state.currentElection) {
          const updated = action.payload.find(e => e.id === state.currentElection.id);
          if (updated) state.currentElection = updated;
        }
      })
      .addCase(fetchElections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { selectCandidate, updateTalliesFromBlock } = electionsSlice.actions;
export default electionsSlice.reducer;
