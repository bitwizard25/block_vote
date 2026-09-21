import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiUrl } from '../../apiConfig';

export const fetchBlocks = createAsyncThunk('blockchain/fetchBlocks', async () => {
  const res = await fetch(apiUrl('/api/blocks'));
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return await res.json();
});

export const fetchMempool = createAsyncThunk('blockchain/fetchMempool', async () => {
  const res = await fetch(apiUrl('/api/mempool'));
  if (!res.ok) throw new Error('Failed to fetch mempool');
  return await res.json();
});

export const fetchNodeStatus = createAsyncThunk('blockchain/fetchNodeStatus', async () => {
  const res = await fetch(apiUrl('/api/node-status'));
  if (!res.ok) throw new Error('Failed to fetch node status');
  return await res.json();
});

export const mineBlock = createAsyncThunk('blockchain/mineBlock', async () => {
  const res = await fetch(apiUrl('/api/mine'), { method: 'POST' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Mining failed');
  }
  return await res.json();
});

export const simulateTamper = createAsyncThunk('blockchain/simulateTamper', async () => {
  const res = await fetch(apiUrl('/api/simulate-tamper'), { method: 'POST' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Tamper failed');
  }
  return await res.json();
});

export const healNode = createAsyncThunk('blockchain/healNode', async () => {
  const res = await fetch(apiUrl('/api/heal-node'), { method: 'POST' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Heal failed');
  }
  return await res.json();
});

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: {
    blocks: [],
    mempool: [],
    nodeStatus: {},
    isMining: false,
    logs: [
      { id: 'boot', time: 'BOOT', tag: 'SYSTEM', msg: 'BlockVote Go Blockchain Online — Apple Design System Active' }
    ],
    error: null,
  },
  reducers: {
    addTelemetryLog: (state, action) => {
      const { tag, msg } = action.payload;
      const time = new Date().toLocaleTimeString();
      state.logs.push({ id: Date.now() + Math.random(), time, tag, msg });
      if (state.logs.length > 80) state.logs.shift();
    },
    onWsVoteCast: (state, action) => {
      const tx = action.payload;
      state.mempool.push(tx);
    },
    onWsBlockMined: (state, action) => {
      const block = action.payload;
      state.blocks.push(block);
      state.mempool = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlocks.fulfilled, (state, action) => {
        state.blocks = action.payload;
      })
      .addCase(fetchMempool.fulfilled, (state, action) => {
        state.mempool = action.payload;
      })
      .addCase(fetchNodeStatus.fulfilled, (state, action) => {
        state.nodeStatus = action.payload;
      })
      .addCase(mineBlock.pending, (state) => {
        state.isMining = true;
      })
      .addCase(mineBlock.fulfilled, (state, action) => {
        state.isMining = false;
        state.blocks.push(action.payload);
        state.mempool = [];
      })
      .addCase(mineBlock.rejected, (state, action) => {
        state.isMining = false;
        state.error = action.error.message;
      });
  }
});

export const { addTelemetryLog, onWsVoteCast, onWsBlockMined } = blockchainSlice.actions;
export default blockchainSlice.reducer;
