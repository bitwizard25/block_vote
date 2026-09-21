import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/voterSlice';
import { IconIdCard, IconCheck, IconArrowRight, IconLogOut } from './icons';

export default function RegisterView({ setActiveTab }) {
  const dispatch = useDispatch();
  const voter = useSelector((state) => state.voter);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voter.mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    dispatch(logout());
    if (setActiveTab) setActiveTab('login');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 className="display-title">My Voter Slip</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Your digital VVPAT slip and the secret key it was issued with. Nobody else, not even
          BlockVote Bharat, can see this key.
        </p>
      </div>

      {voter.verified ? (
        <div className="apple-wallet-pass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--apple-gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Election Commission of India • Digital Slip
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                Official Digital Voter Slip
              </h3>
            </div>
            <span className="status-pill" style={{ background: 'rgba(48, 209, 88, 0.2)' }}>
              <IconCheck size={12} /> VERIFIED VOTER
            </span>
          </div>

          {voter.epic && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
              Registered against Voter ID <strong className="mono" style={{ color: '#fff' }}>{voter.epic}</strong>.
            </p>
          )}

          <div className="pass-seed-box">{voter.mnemonic}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Voter Secret Key:</strong>{' '}
              <span className="mono" style={{ color: '#fff' }}>
                {voter.voterSecret ? voter.voterSecret.substring(0, 16) : ''}...
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="apple-btn apple-btn-secondary" onClick={handleCopy} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                {copied ? <><IconCheck size={12} /> Copied</> : 'Copy Words'}
              </button>
              {setActiveTab && (
                <button className="apple-btn apple-btn-primary" onClick={() => setActiveTab('voting')} style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                  Cast Vote Now <IconArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginTop: '18px',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '0.8rem'
            }}
          >
            <IconLogOut size={14} /> Log out of this session
          </button>
        </div>
      ) : (
        <div className="glass-sheet" style={{ textAlign: 'center' }}>
          <IconIdCard size={28} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            No voter slip on this session yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            You're browsing as a guest observer. Sign in with your Aadhaar and Voter ID to get a
            digital voter slip and cast a ballot.
          </p>
          {setActiveTab && (
            <button className="apple-btn apple-btn-primary" onClick={() => setActiveTab('login')}>
              Sign In <IconArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
