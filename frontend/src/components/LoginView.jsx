import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog } from '@base-ui/react/dialog';
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import { requestAadhaarOTP, verifyAadhaarOTP, cancelOtp, setVoterSecretDirect } from '../store/slices/voterSlice';
import {
  IconEmblem, IconIdCard, IconWarningTriangle, IconPhoneOtp, IconArrowRight,
  IconLock, IconVvpat, IconMesh, IconEye
} from './icons';

function OtpSlot({ char, isActive, hasFakeCaret }) {
  return (
    <div className={`otp-slot ${isActive ? 'active' : ''}`}>
      {char}
      {hasFakeCaret && <div className="otp-caret" />}
    </div>
  );
}

const trustPoints = [
  { icon: IconLock, text: 'Your Aadhaar number is checked once, then discarded. It never touches the ledger.' },
  { icon: IconVvpat, text: 'Every ballot mirrors the same paper-slip confirmation voters already trust at the booth.' },
  { icon: IconMesh, text: 'Three independent nodes cross-check each other. No single server decides the count.' },
];

export default function LoginView({ onSuccess, onBack }) {
  const dispatch = useDispatch();
  const voter = useSelector((state) => state.voter);

  const [aadhaarInput, setAadhaarInput] = useState(voter.aadhaar || '8473-9281-7287');
  const [epicInput, setEpicInput] = useState(voter.epic || 'ABC1234567');
  const [otpInput, setOtpInput] = useState('');
  const [secretMode, setSecretMode] = useState(false);
  const [secretInput, setSecretInput] = useState('');

  const handleRequestOTP = (e) => {
    e.preventDefault();
    dispatch(requestAadhaarOTP({ aadhaar: aadhaarInput, epic: epicInput })).then((res) => {
      if (!res.error && res.payload.demo_otp) {
        setOtpInput(res.payload.demo_otp);
      }
    });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    dispatch(verifyAadhaarOTP({ aadhaar: voter.aadhaar, epic: voter.epic, otp: otpInput })).then((res) => {
      if (!res.error) onSuccess();
    });
  };

  const handleSecretSignIn = (e) => {
    e.preventDefault();
    if (!secretInput.trim()) return;
    dispatch(setVoterSecretDirect(secretInput.trim()));
    onSuccess();
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        {/* Brand / trust panel */}
        <div className="login-brand-panel">
          <button type="button" className="login-brand-mark" onClick={onBack} aria-label="Back to BlockVote Bharat home">
            <IconEmblem size={18} />
            <span>BlockVote<span className="login-brand-accent">.Bharat</span></span>
          </button>

          <h1 className="login-brand-title">
            Your vote, verified without exposing who you are.
          </h1>
          <p className="login-brand-sub">
            Aadhaar confirms you are a registered citizen. Everything after that runs on a
            secret only you hold.
          </p>

          <ul className="login-trust-list">
            {trustPoints.map((point, idx) => (
              <li key={idx} className="login-trust-item">
                <point.icon size={18} />
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth card */}
        <div className="login-form-panel">
          <div className="login-form-card">
            <div className="login-form-head">
              <IconIdCard size={22} style={{ color: 'var(--apple-blue)' }} />
              <h2>Sign in to BlockVote Bharat</h2>
              <p>Verify with your Aadhaar and Voter ID to unlock your ballot.</p>
            </div>

            {!secretMode ? (
              <>
                <form onSubmit={handleRequestOTP}>
                  <div className="apple-field-group">
                    <label className="apple-label">Aadhaar Card Number (12 Digits)</label>
                    <input
                      type="text"
                      className="apple-input mono"
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      required
                    />
                  </div>

                  <div className="apple-field-group">
                    <label className="apple-label">Voter ID Card Number (EPIC)</label>
                    <input
                      type="text"
                      className="apple-input mono"
                      value={epicInput}
                      onChange={(e) => setEpicInput(e.target.value.toUpperCase())}
                      placeholder="ABC1234567"
                      required
                    />
                    <div className="apple-hint">Election Commission of India's standard 10-character ID format.</div>
                  </div>

                  {voter.regError && (
                    <div className="login-error">
                      <IconWarningTriangle size={16} style={{ flexShrink: 0 }} /> {voter.regError}
                    </div>
                  )}

                  <button type="submit" className="apple-btn apple-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                    Request Aadhaar OTP
                  </button>
                </form>

                <div className="login-divider"><span>or</span></div>

                <button type="button" className="login-link-btn" onClick={() => setSecretMode(true)}>
                  <IconLock size={14} /> Sign in with your Voter Secret Key
                </button>
              </>
            ) : (
              <>
                <form onSubmit={handleSecretSignIn}>
                  <div className="apple-field-group">
                    <label className="apple-label" htmlFor="login-secret-input">Voter Secret Key</label>
                    <input
                      id="login-secret-input"
                      type="text"
                      className="apple-input mono"
                      value={secretInput}
                      onChange={(e) => setSecretInput(e.target.value)}
                      placeholder="e.g. 9b6e82813589b2b5424cf3c4a45610ec87870a6d..."
                      autoFocus
                      required
                    />
                    <div className="apple-hint">The key your VVPAT slip gave you the first time you verified.</div>
                  </div>

                  <button type="submit" className="apple-btn apple-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                    Sign In
                  </button>
                </form>

                <div className="login-divider"><span>or</span></div>

                <button type="button" className="login-link-btn" onClick={() => setSecretMode(false)}>
                  <IconIdCard size={14} /> Verify with Aadhaar instead
                </button>
              </>
            )}

            <button type="button" className="login-guest-btn" onClick={onSuccess}>
              <IconEye size={14} /> Continue as guest observer <IconArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* OTP Sheet Modal */}
      <Dialog.Root
        open={voter.otpRequested}
        onOpenChange={(open) => { if (!open) dispatch(cancelOtp()); }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="modal-scrim" />
          <Dialog.Viewport className="modal-viewport">
            <Dialog.Popup className="modal-sheet-panel">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--apple-blue)' }}>
                  <IconPhoneOtp size={36} />
                </div>
                <Dialog.Title style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                  Aadhaar Mobile OTP Verification
                </Dialog.Title>
                <Dialog.Description style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                  Enter the 6-digit OTP sent to the mobile number linked to your Aadhaar (ending in <strong>7287</strong>).
                </Dialog.Description>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <div className="apple-field-group">
                  <OTPInput
                    value={otpInput}
                    onChange={setOtpInput}
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    containerClassName="otp-container"
                    autoFocus
                    render={({ slots }) => (
                      <>
                        {slots.map((slot, idx) => <OtpSlot key={idx} {...slot} />)}
                      </>
                    )}
                  />
                  <div className="apple-hint" style={{ textAlign: 'center', color: 'var(--apple-amber)' }}>
                    Demo mode: the OTP has been auto-filled for you.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Dialog.Close className="apple-btn apple-btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </Dialog.Close>
                  <button type="submit" className="apple-btn apple-btn-primary" style={{ flex: 2 }}>
                    Verify & Sign In
                  </button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
