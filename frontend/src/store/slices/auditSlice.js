import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiUrl } from '../../apiConfig';

export const auditReceipt = createAsyncThunk('audit/auditReceipt', async (receiptHash) => {
  const res = await fetch(apiUrl('/api/audit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receipt_hash: receiptHash })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Receipt not found');
  }
  return await res.json();
});

const auditSlice = createSlice({
  name: 'audit',
  initialState: {
    receiptInput: '',
    auditResult: null,
    isAuditing: false,
    error: null,
  },
  reducers: {
    setReceiptInput: (state, action) => {
      state.receiptInput = action.payload;
    },
    clearAudit: (state) => {
      state.auditResult = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(auditReceipt.pending, (state) => {
        state.isAuditing = true;
        state.error = null;
      })
      .addCase(auditReceipt.fulfilled, (state, action) => {
        state.isAuditing = false;
        state.auditResult = action.payload;
      })
      .addCase(auditReceipt.rejected, (state, action) => {
        state.isAuditing = false;
        state.error = action.error.message;
        state.auditResult = null;
      });
  }
});

export const { setReceiptInput, clearAudit } = auditSlice.actions;
export default auditSlice.reducer;
