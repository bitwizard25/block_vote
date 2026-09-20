import { describe, it, expect } from 'vitest';
import auditReducer, { setReceiptInput, clearAudit } from '../store/slices/auditSlice';

describe('auditSlice', () => {
  const initialState = {
    receiptInput: '',
    auditResult: null,
    isAuditing: false,
    error: null,
  };

  it('sets receipt input hash', () => {
    const nextState = auditReducer(initialState, setReceiptInput('sha3_receipt_hash_987654'));
    expect(nextState.receiptInput).toBe('sha3_receipt_hash_987654');
  });

  it('clears audit result and error state', () => {
    const stateWithResult = {
      ...initialState,
      auditResult: { verified: true, block_index: 1 },
      error: 'Previous error'
    };
    const nextState = auditReducer(stateWithResult, clearAudit());
    expect(nextState.auditResult).toBeNull();
    expect(nextState.error).toBeNull();
  });
});
