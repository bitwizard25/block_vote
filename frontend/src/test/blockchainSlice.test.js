import { describe, it, expect } from 'vitest';
import blockchainReducer, {
  addTelemetryLog,
  onWsVoteCast,
  onWsBlockMined
} from '../store/slices/blockchainSlice';

describe('blockchainSlice', () => {
  const initialState = {
    blocks: [],
    mempool: [],
    nodeStatus: {},
    isMining: false,
    logs: [],
    error: null,
  };

  it('adds telemetry logs with proper tag and timestamp', () => {
    const nextState = blockchainReducer(initialState, addTelemetryLog({ tag: 'CRYPTO', msg: 'Key generated' }));
    expect(nextState.logs).toHaveLength(1);
    expect(nextState.logs[0].tag).toBe('CRYPTO');
    expect(nextState.logs[0].msg).toBe('Key generated');
    expect(nextState.logs[0].time).toBeDefined();
  });

  it('stages a new vote transaction in the mempool on WS vote cast', () => {
    const mockTx = {
      receipt_hash: 'abc123hash',
      candidate_id: 1,
      nullifier: 'nullifier_secret'
    };
    const nextState = blockchainReducer(initialState, onWsVoteCast(mockTx));
    expect(nextState.mempool).toHaveLength(1);
    expect(nextState.mempool[0].receipt_hash).toBe('abc123hash');
  });

  it('appends mined block and flushes mempool on WS block mined', () => {
    const stateWithMempool = {
      ...initialState,
      mempool: [{ receipt_hash: 'tx1' }],
      blocks: [{ index: 0, hash: 'genesis' }]
    };

    const mockBlock = {
      index: 1,
      hash: '0000abcblock1',
      transactions: [{ receipt_hash: 'tx1' }]
    };

    const nextState = blockchainReducer(stateWithMempool, onWsBlockMined(mockBlock));
    expect(nextState.blocks).toHaveLength(2);
    expect(nextState.blocks[1].hash).toBe('0000abcblock1');
    expect(nextState.mempool).toHaveLength(0);
  });
});
