import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestAadhaarOTP, verifyAadhaarOTP, cancelOtp } from '../store/slices/voterSlice';

export default function RegisterView() {
  const dispatch = useDispatch();
  const voter = useSelector((state) => state.voter);

  const [aadhaarInput, setAadhaarInput] = useState(voter.aadhaar || '8473-9281-7287');
  const [epicInput, setEpicInput] = useState(voter.epic || 'ABC1234567');
  const [otpInput, setOtpInput] = useState('');
  const [copied, setCopied] = useState(false);

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
    dispatch(verifyAadhaarOTP({ aadhaar: voter.aadhaar, epic: voter.epic, otp: otpInput }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(voter.mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">Voter Registration</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Verify your citizenship via Aadhaar & Voter ID. Your identity produces a zero-knowledge commitment; your personal data is never written to the blockchain.
        </p>
      </div>

      <div className="glass-sheet">
        <form onSubmit={handleRequestOTP}>
          <div className="apple-field-group">
            <label className="apple-label">Aadhaar Number (12 Digits)</label>
            <input
              type="text"
              className="apple-input mono"
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              required
            />
            <div className="apple-hint">Verified using the Verhoeff checksum algorithm to prevent transposition errors.</div>
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
            <div className="apple-hint">Standard 10-character Election Commission of India identifier.</div>
          </div>

          {voter.regError && (
            <div style={{ color: 'var(--apple-red)', fontSize: '0.85rem', marginBottom: '16px' }}>
              ⚠️ {voter.regError}
            </div>
          )}

          <button type="submit" className="apple-btn apple-btn-primary" style={{ width: '100%' }}>
            Request Aadhaar OTP Challenge
          </button>
        </form>

        {/* Apple Wallet Style Voter Passport */}
        {voter.verified && (
          <div className="apple-wallet-pass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Apple Wallet Pass
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                  Voter Cryptographic Passport
                </h3>
              </div>
              <span className="status-pill">ELIGIBLE</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
              Keep this 12-word mnemonic seed safe. This is your personal cryptographic passkey used to sign your ballot without revealing your identity.
            </p>

            <div className="pass-seed-box">{voter.mnemonic}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Secret Key:</strong>{' '}
                <span className="mono" style={{ color: '#fff' }}>
                  {voter.voterSecret.substring(0, 16)}...
                </span>
              </div>
              <button className="apple-btn apple-btn-secondary" onClick={handleCopy} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                {copied ? '✓ Copied' : 'Copy Words'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* iOS Passkey Style OTP Sheet Modal */}
      {voter.otpRequested && (
        <div className="modal-scrim">
          <div className="modal-sheet-panel">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔐</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Aadhaar OTP Authentication</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                Simulating secure UIDAI challenge sent to registered phone ending in <strong>7287</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOTP}>
              <div className="apple-field-group">
                <input
                  type="text"
                  className="apple-input mono"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '8px', fontWeight: 700 }}
                  required
                  autoFocus
                />
                <div className="apple-hint" style={{ textAlign: 'center', color: 'var(--apple-orange)' }}>
                  Demo OTP auto-filled for instant testing.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="apple-btn apple-btn-secondary"
                  onClick={() => dispatch(cancelOtp())}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="apple-btn apple-btn-primary" style={{ flex: 2 }}>
                  Verify & Issue Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
