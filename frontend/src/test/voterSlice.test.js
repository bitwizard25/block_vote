import { describe, it, expect } from 'vitest';
import voterReducer, {
  setVoterSecretDirect,
  resetVoteState,
  cancelOtp
} from '../store/slices/voterSlice';

describe('voterSlice', () => {
  const initialState = {
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
  };

  it('updates voter secret directly', () => {
    const nextState = voterReducer(initialState, setVoterSecretDirect('my_new_secret_key_12345'));
    expect(nextState.voterSecret).toBe('my_new_secret_key_12345');
  });

  it('resets vote success and error flags', () => {
    const stateWithVote = {
      ...initialState,
      voteSuccess: true,
      voteError: 'Some error'
    };
    const nextState = voterReducer(stateWithVote, resetVoteState());
    expect(nextState.voteSuccess).toBe(false);
    expect(nextState.voteError).toBeNull();
  });

  it('cancels OTP modal challenge', () => {
    const stateWithOtp = {
      ...initialState,
      otpRequested: true
    };
    const nextState = voterReducer(stateWithOtp, cancelOtp());
    expect(nextState.otpRequested).toBe(false);
  });
});
