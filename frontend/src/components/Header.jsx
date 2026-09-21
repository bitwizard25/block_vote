import React from 'react';
import { useSelector } from 'react-redux';
import {
  IconEmblem, IconBallotBox, IconIdCard, IconVvpat, IconPulse, IconLedger,
  IconShieldCheck, IconMenu, IconClose, IconUser, IconArrowRight, IconDot
} from './icons';

export function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const voter = useSelector(state => (state && state.voter) ? state.voter : {});
  const isRegistered = !!(voter.aadhaarHash || voter.mnemonic);

  const citizenTabs = [
    { id: 'voting', icon: IconBallotBox, label: 'EVM Voting Booth', sub: 'Vote daalo yahan' },
    { id: 'register', icon: IconIdCard, label: 'Voter ID & Slip', sub: 'Apni matdata parchi lo' },
    { id: 'audit', icon: IconVvpat, label: 'VVPAT Audit', sub: 'Vote parchi verify karo' },
  ];

  const adminTabs = [
    { id: 'dashboard', icon: IconPulse, label: 'Election Overview', sub: 'Live chunav dashboard' },
    { id: 'explorer', icon: IconLedger, label: 'Public Vote Ledger', sub: 'Sabka khula bahi-khata' },
    { id: 'attacks', icon: IconShieldCheck, label: 'Security & Integrity', sub: 'Suraksha aur tamper check' },
  ];

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {sidebarOpen && (
        <div
          className="modal-scrim"
          style={{ zIndex: 110 }}
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}

      {/* Figma Platform Left Sidebar */}
      <aside className={`platform-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="brand-badge-box brand-badge-link"
            onClick={() => setActiveTab('home')}
            aria-label="Back to BlockVote Bharat home"
          >
            <div className="brand-emblem"><IconEmblem size={20} /></div>
            <div>
              <div className="brand-title">
                BlockVote<span>.Bharat</span>
              </div>
              <div className="brand-sub">Desh Ka Digital Voting Platform</div>
            </div>
          </button>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="sidebar-nav">
          <div>
            <div className="nav-section-title">CITIZEN VOTING • Janta Ki Seva</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {citizenTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-item-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (setSidebarOpen) setSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon"><tab.icon size={19} /></span>
                  <div className="nav-text-col">
                    <span>{tab.label}</span>
                    <span className="nav-label-hi">{tab.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="nav-section-title">COMMISSION & LEDGER • Chunav Aayog</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {adminTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-item-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (setSidebarOpen) setSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon"><tab.icon size={19} /></span>
                  <div className="nav-text-col">
                    <span>{tab.label}</span>
                    <span className="nav-label-hi">{tab.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Citizen Status Footer Card */}
        <div className="sidebar-citizen-card">
          <div
            className="citizen-info-pill"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setActiveTab('register');
              if (setSidebarOpen) setSidebarOpen(false);
            }}
          >
            <div className="citizen-avatar">
              {isRegistered ? <IconEmblem size={16} /> : <IconUser size={16} />}
            </div>
            <div className="citizen-status-col">
              <div className="citizen-name">
                {isRegistered ? (voter.epic || 'Verified Citizen') : 'Aam Nagrik (Citizen)'}
              </div>
              <div className={`citizen-status-tag ${isRegistered ? 'verified' : 'unverified'}`}>
                <IconDot size={7} /> {isRegistered ? 'Slip Ready Hai' : 'Parchi Banayein'}
              </div>
            </div>
            <IconArrowRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const voter = useSelector(state => (state && state.voter) ? state.voter : {});
  const isRegistered = !!(voter.aadhaarHash || voter.mnemonic);

  const titles = {
    voting: 'EVM Voting Booth (Vote Daalo)',
    register: 'Voter ID & Slip (Parchi Lo)',
    audit: 'VVPAT Audit (Parchi Check Karo)',
    dashboard: 'Election Overview (Live Dashboard)',
    explorer: 'Public Vote Ledger (Khula Khata)',
    attacks: 'Security & Integrity (Suraksha Lab)',
  };

  return (
    <header className="platform-topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation"
        >
          <IconMenu size={18} />
        </button>
        <div className="topbar-breadcrumbs">
          <span className="breadcrumb-hide-mobile">Election Commission of India / 2026 Lok Sabha / </span>
          <strong>{titles[activeTab] || 'Election Portal'}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="network-pill">
          <span className="pulse-dot"></span>
          <span className="net-pill-text-desktop">3-NODE CONSENSUS ACTIVE</span>
          <span className="net-pill-text-mobile">3 NODES</span>
        </div>

        <button
          className="topbar-voter-action"
          onClick={() => setActiveTab(isRegistered ? 'voting' : 'register')}
        >
          {isRegistered ? <IconBallotBox size={15} /> : <IconIdCard size={15} />}
          <span className="voter-btn-text-desktop">{isRegistered ? 'Cast Vote (Vote Daalo)' : 'Get Voter Slip (Parchi Lo)'}</span>
          <span className="voter-btn-text-mobile">{isRegistered ? 'Vote' : 'Slip'}</span>
        </button>
      </div>
    </header>
  );
}

export default function Header(props) {
  return (
    <div className="header-composite">
      <Sidebar {...props} />
      <TopBar {...props} />
    </div>
  );
}
