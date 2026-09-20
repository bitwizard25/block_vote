import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const requestAadhaarOTP = createAsyncThunk('voter/requestOTP', async ({ aadhaar, epic }) => {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aadhaar, epic })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Registration failed');
  }
  return await res.json();
});

export const verifyAadhaarOTP = createAsyncThunk('voter/verifyOTP', async ({ aadhaar, epic, otp }) => {
  const res = await fetch('/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aadhaar, epic, otp })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'OTP verification failed');
  }
  return await res.json();
});

export const castBallot = createAsyncThunk('voter/castBallot', async ({ election_id, candidate_id, voter_secret }) => {
  const res = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ election_id, candidate_id, voter_secret })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Vote rejected');
  }
  return await res.json();
});

const voterSlice = createSlice({
  name: 'voter',
  initialState: {
    aadhaar: '8473-9281-7287',
    epic: 'ABC1234567',
    otpRequested: false,
    demoOtp: '',
    verified: false,
    voterSecret: '',
    mnemonic: '',
    commitment: '',
    lastReceiptHash: '',
    isSubmittingVote: false,
    voteSuccess: false,
    voteError: null,
    regError: null,
  },
  reducers: {
    setVoterSecretDirect: (state, action) => {
      state.voterSecret = action.payload;
    },
    resetVoteState: (state) => {
      state.voteSuccess = false;
      state.voteError = null;
    },
    cancelOtp: (state) => {
      state.otpRequested = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Request OTP
      .addCase(requestAadhaarOTP.pending, (state) => {
        state.regError = null;
      })
      .addCase(requestAadhaarOTP.fulfilled, (state, action) => {
        state.otpRequested = true;
        state.demoOtp = action.payload.demo_otp;
        state.aadhaar = action.payload.aadhaar;
        state.epic = action.payload.epic;
      })
      .addCase(requestAadhaarOTP.rejected, (state, action) => {
        state.regError = action.error.message;
      })
      // Verify OTP
      .addCase(verifyAadhaarOTP.fulfilled, (state, action) => {
        state.verified = true;
        state.otpRequested = false;
        state.voterSecret = action.payload.voter_secret;
        state.mnemonic = action.payload.mnemonic;
        state.commitment = action.payload.commitment;
      })
      .addCase(verifyAadhaarOTP.rejected, (state, action) => {
        state.regError = action.error.message;
      })
      // Cast Ballot
      .addCase(castBallot.pending, (state) => {
        state.isSubmittingVote = true;
        state.voteError = null;
        state.voteSuccess = false;
      })
      .addCase(castBallot.fulfilled, (state, action) => {
        state.isSubmittingVote = false;
        state.voteSuccess = true;
        state.lastReceiptHash = action.payload.receipt_hash;
      })
      .addCase(castBallot.rejected, (state, action) => {
        state.isSubmittingVote = false;
        state.voteError = action.error.message;
      });
  }
});

export const { setVoterSecretDirect, resetVoteState, cancelOtp } = voterSlice.actions;
export default voterSlice.reducer;
