import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { mineBlock } from '../store/slices/blockchainSlice';
import P2PCanvas from './P2PCanvas';
import { IconIdCard, IconBallotBox } from './icons';
import { getPartySymbolIcon } from './partySymbols';

export default function DashboardView({ setActiveTab }) {
  const dispatch = useDispatch();
  const { blocks, mempool, isMining, logs } = useSelector((state) => state.blockchain);
  const { currentElection } = useSelector((state) => state.elections);

  let totalVotes = 0;
  blocks.forEach((b) => {
    if (b.transactions) totalVotes += b.transactions.length;
  });

  const handleMine = () => {
    dispatch(mineBlock());
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="display-title">Lok Sabha General Election 2026 (Lok Sabha Aam Chunav)</h1>
          <p className="display-subtitle" style={{ marginBottom: 0 }}>
            National Election Commission Portal — Real-time transparent voter participation, decentralized observer consensus, aur public counting ledger.
          </p>
        </div>
        {setActiveTab && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="apple-btn apple-btn-secondary" onClick={() => setActiveTab('register')}>
              <IconIdCard size={15} /> Get Slip (Parchi Lo)
            </button>
            <button className="apple-btn apple-btn-primary" onClick={() => setActiveTab('voting')}>
              <IconBallotBox size={15} /> Cast Vote (Vote Daalo)
            </button>
          </div>
        )}
      </div>

      {/* Stats Bento Grid */}
      <div className="stats-bento">
        <div className="stat-cell">
          <div className="stat-caption">Sealed EVM Blocks (Seal Kiye Gaye Blocks)</div>
          <div className="stat-number">{blocks.length}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-caption">Votes in Queue (Queue Me Pade Votes)</div>
          <div className="stat-number" style={{ color: mempool.length > 0 ? 'var(--apple-amber)' : '#fff' }}>
            {mempool.length}
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-caption">Total Votes Cast (Kul Dale Gaye Votes)</div>
          <div className="stat-number" style={{ color: 'var(--apple-green)' }}>{totalVotes}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-caption">Observer Nodes (3 Active Mesh Peers)</div>
          <div className="stat-number" style={{ color: 'var(--apple-blue)' }}>3 Mesh Peers</div>
        </div>
      </div>

      {/* Live Candidate Tally Overview */}
      {currentElection?.candidates && (
        <div className="double-bezel-wrapper">
          <div className="double-bezel-core">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  Live Counting & Kaun Aage Hai (Live Standings)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  On-chain mined blocks se mathematically calculate kiya gaya tally, sabhi 3 observer nodes dwara verified.
                </p>
              </div>
              <span className="status-pill" style={{ fontSize: '0.72rem' }}>
                LIVE BLOCKCHAIN TALLY
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {currentElection.candidates.map((cand) => {
                const pct = totalVotes > 0 ? Math.round(((cand.vote_count || 0) / totalVotes) * 100) : 0;
                return (
                  <div
                    key={cand.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '34px',
                          background: '#fff',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000'
                        }}>
                          {getPartySymbolIcon(cand, { size: 21 })}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{cand.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cand.party}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--apple-blue)' }}>{cand.vote_count || 0}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{pct}% votes</div>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--apple-blue)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Network Canvas Sheet */}
      <div className="glass-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Decentralized Election Mesh (Chunav Monitoring Network)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Multi-node network jo har EVM ballot ko Node-Alpha, Node-Beta aur Node-Gamma ke beech cross-verify karta hai.
            </p>
          </div>
          <button
            className="apple-btn apple-btn-primary"
            onClick={handleMine}
            disabled={isMining || mempool.length === 0}
            style={{ opacity: mempool.length === 0 ? 0.6 : 1 }}
          >
            {isMining ? 'PoW Se Block Seal Ho Raha Hai...' : `Seal & Count ${mempool.length} Votes (Votes Count Karo)`}
          </button>
        </div>

        <P2PCanvas />
      </div>

      {/* Live Telemetry Stream */}
      <div className="glass-sheet">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Live Transparent Election Log (Chunav Ka Khula Audit Log)</h3>
        <div style={{
          background: 'rgba(10, 10, 14, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          height: '190px',
          overflowY: 'auto',
          lineHeight: '1.6'
        }}>
          {logs.map((log) => (
            <div key={log.id}>
              <span style={{ color: 'var(--text-tertiary)', marginRight: '8px' }}>[{log.time}]</span>
              <span style={{ color: 'var(--apple-blue)', fontWeight: 600, marginRight: '8px' }}>[{log.tag}]</span>
              <span style={{ color: 'var(--text-primary)' }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
