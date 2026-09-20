import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Election Overview' },
    { id: 'register', label: 'Voter ID & Slip' },
    { id: 'voting', label: 'EVM Voting Booth' },
    { id: 'explorer', label: 'Public Vote Ledger' },
    { id: 'audit', label: 'VVPAT Audit' },
    { id: 'attacks', label: 'Security & Integrity' },
  ];

  return (
    <header className="apple-header">
      <div className="header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: 'linear-gradient(145deg, #2c2c36, #16161e)',
            border: '1px solid var(--material-top-edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '1.1rem'
          }}>
            🇮🇳
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
            BlockVote<span style={{ color: 'var(--apple-blue)' }}>.Bharat</span>
            <span className="brand-badge-pill">ELECTION PORTAL</span>
          </div>
        </div>

        <nav className="segmented-control">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`segment-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="status-pill">
          <div className="green-dot"></div>
          <span>3-NODE CONSENSUS</span>
        </div>
      </div>
    </header>
  );
}
