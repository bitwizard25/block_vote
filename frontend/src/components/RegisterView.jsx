import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestAadhaarOTP, verifyAadhaarOTP, cancelOtp } from '../store/slices/voterSlice';

export default function RegisterView({ setActiveTab }) {
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
        <h1 className="display-title">Voter Verification & Digital Slip</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          मतदाता सत्यापन व डिजिटल पर्ची — Verify your name on the official electoral roll using your Aadhaar & Voter ID. Your private identity is never exposed on the blockchain.
        </p>
      </div>

      <div className="glass-sheet">
        <form onSubmit={handleRequestOTP}>
          <div className="apple-field-group">
            <label className="apple-label">Aadhaar Card Number / आधार संख्या (12 Digits)</label>
            <input
              type="text"
              className="apple-input mono"
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              required
            />
            <div className="apple-hint">
              Checked with the government Verhoeff checksum algorithm to prevent any typing mistakes.
            </div>
          </div>

          <div className="apple-field-group">
            <label className="apple-label">Voter ID Card Number (EPIC) / मतदाता पहचान पत्र</label>
            <input
              type="text"
              className="apple-input mono"
              value={epicInput}
              onChange={(e) => setEpicInput(e.target.value.toUpperCase())}
              placeholder="ABC1234567"
              required
            />
            <div className="apple-hint">Standard 10-character Election Commission of India (ECI) identifier.</div>
          </div>

          {voter.regError && (
            <div style={{ color: 'var(--apple-red)', fontSize: '0.85rem', marginBottom: '16px' }}>
              ⚠️ {voter.regError}
            </div>
          )}

          <button type="submit" className="apple-btn apple-btn-primary" style={{ width: '100%' }}>
            Request Aadhaar OTP / ओटीपी प्राप्त करें
          </button>
        </form>

        {/* Digital Matdata Pass / Voter Slip */}
        {voter.verified && (
          <div className="apple-wallet-pass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Election Commission of India • Digital Slip
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                  Official Digital Voter Slip (डिजिटल मतदाता पर्ची)
                </h3>
              </div>
              <span className="status-pill" style={{ background: 'rgba(52, 199, 89, 0.2)' }}>
                VERIFIED VOTER (मतदान हेतु पात्र)
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
              Your vote is 100% secret. This 12-word cryptographic passkey is issued only to you. No candidate, polling officer, or government server can see who you vote for.
            </p>

            <div className="pass-seed-box">{voter.mnemonic}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Voter Secret Key:</strong>{' '}
                <span className="mono" style={{ color: '#fff' }}>
                  {voter.voterSecret.substring(0, 16)}...
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="apple-btn apple-btn-secondary" onClick={handleCopy} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  {copied ? '✓ Copied' : 'Copy Words'}
                </button>
                {setActiveTab && (
                  <button className="apple-btn apple-btn-primary" onClick={() => setActiveTab('voting')} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    Cast Vote Now (मत दें) →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* iOS Style OTP Sheet Modal */}
      {voter.otpRequested && (
        <div className="modal-scrim">
          <div className="modal-sheet-panel">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📲</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Aadhaar Mobile OTP Verification</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                आधार से जुड़े मोबाइल नंबर पर भेजा गया 6-अंकों का ओटीपी दर्ज करें (Sent to mobile ending in <strong>7287</strong>).
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
                  Cancel (रद्द करें)
                </button>
                <button type="submit" className="apple-btn apple-btn-primary" style={{ flex: 2 }}>
                  Verify & Issue Slip (सत्यापित करें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
