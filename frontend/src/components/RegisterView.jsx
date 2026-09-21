import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog } from '@base-ui/react/dialog';
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import { requestAadhaarOTP, verifyAadhaarOTP, cancelOtp } from '../store/slices/voterSlice';
import { IconIdCard, IconWarningTriangle, IconPhoneOtp, IconCheck, IconArrowRight } from './icons';

function OtpSlot({ char, isActive, hasFakeCaret }) {
  return (
    <div className={`otp-slot ${isActive ? 'active' : ''}`}>
      {char}
      {hasFakeCaret && <div className="otp-caret" />}
    </div>
  );
}

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
    <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      {/* Voter Journey Progress Tracker */}
      <div className="voter-journey-strip" style={{ marginBottom: '24px' }}>
        <div className={`journey-step-item ${voter.verified ? 'done' : 'active'}`}>
          <div className="journey-step-badge">1</div>
          <div>
            <div>1. Verify Identity & Get Slip</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Pehle Parchi Lo</div>
          </div>
        </div>
        <div className="journey-arrow"><IconArrowRight size={14} /></div>
        <div className="journey-step-item">
          <div className="journey-step-badge">2</div>
          <div>
            <div>2. Go to EVM Booth</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Booth Par Vote Daalo</div>
          </div>
        </div>
        <div className="journey-arrow"><IconArrowRight size={14} /></div>
        <div className="journey-step-item">
          <div className="journey-step-badge">3</div>
          <div>
            <div>3. VVPAT Audit</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Parchi Check Karo</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 className="display-title">Voter Verification & Digital Slip</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Aadhaar aur Voter ID se electoral roll me apna naam verify karein aur digital voter slip paayein. Aapka Aadhaar number blockchain pe kabhi save nahi hota.
        </p>
      </div>

      {/* Double Bezel Machined Card */}
      <div className="double-bezel-wrapper">
        <div className="double-bezel-core">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconIdCard size={19} style={{ color: 'var(--apple-blue)' }} />
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Citizen Electoral Verification</strong>
            </div>
            <span className="status-pill" style={{ fontSize: '0.72rem' }}>
              ECI VERIFIED ROLL
            </span>
          </div>

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
              <div className="apple-hint">
                Mathematical <strong>Verhoeff checksum algorithm</strong> ($D_5$) se check hota hai taaki koi galat number na daal sake.
              </div>
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
              <div className="apple-hint">Election Commission of India ka standard 10-character ID format.</div>
            </div>

            {voter.regError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--apple-red)', fontSize: '0.85rem', marginBottom: '16px', background: 'rgba(255, 69, 58, 0.12)', padding: '10px 14px', borderRadius: '10px' }}>
                <IconWarningTriangle size={16} style={{ flexShrink: 0 }} /> {voter.regError}
              </div>
            )}

            <button type="submit" className="apple-btn apple-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              Request Aadhaar OTP (OTP Mangwayein)
            </button>
          </form>

          {/* Digital Matdata Pass / Voter Slip */}
          {voter.verified && (
            <div className="apple-wallet-pass" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--apple-gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Election Commission of India • Digital Slip
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    Official Digital Voter Slip (Digital Matdata Parchi)
                  </h3>
                </div>
                <span className="status-pill" style={{ background: 'rgba(48, 209, 88, 0.2)' }}>
                  <IconCheck size={12} /> VERIFIED VOTER (Vote Daalne Ke Liye Ready)
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px', lineHeight: 1.5 }}>
                Aapka vote 100% secret hai. Yeh 12-shabdon ki secret key sirf aapke paas hai. Koi bhi polling officer, neta ya government server yeh nahi dekh sakta ki aapne kisko vote diya.
              </p>

              <div className="pass-seed-box">{voter.mnemonic}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <strong>Voter Secret Key:</strong>{' '}
                  <span className="mono" style={{ color: '#fff' }}>
                    {voter.voterSecret ? voter.voterSecret.substring(0, 16) : ''}...
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="apple-btn apple-btn-secondary" onClick={handleCopy} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                    {copied ? <><IconCheck size={12} /> Copied</> : 'Copy Words (Words Copy Karo)'}
                  </button>
                  {setActiveTab && (
                    <button className="apple-btn apple-btn-primary" onClick={() => setActiveTab('voting')} style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                      Cast Vote Now (Abhi Vote Daalo) <IconArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* iOS Style OTP Sheet Modal */}
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
                  Aadhaar se linked mobile number par aaya 6-digit OTP yahan daalein (Sent to mobile ending in <strong>7287</strong>).
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
                    Demo testing ke liye OTP auto-fill kar diya gaya hai.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Dialog.Close className="apple-btn apple-btn-secondary" style={{ flex: 1 }}>
                    Cancel (Radd Karein)
                  </Dialog.Close>
                  <button type="submit" className="apple-btn apple-btn-primary" style={{ flex: 2 }}>
                    Verify & Issue Slip (Verify Karke Parchi Lo)
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
