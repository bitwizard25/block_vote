import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'register', label: 'Aadhaar KYC' },
    { id: 'voting', label: 'Secret Ballot' },
    { id: 'explorer', label: 'Block Explorer' },
    { id: 'audit', label: 'Merkle Auditor' },
    { id: 'attacks', label: 'Attack Sandbox' },
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
            ⚡
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
            BlockVote<span style={{ color: 'var(--apple-blue)' }}>.Go</span>
            <span className="brand-badge-pill">APPLE DESIGN</span>
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
          <span>3-NODE MESH</span>
        </div>
      </div>
    </header>
  );
}
