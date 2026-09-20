import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { mineBlock } from '../store/slices/blockchainSlice';
import P2PCanvas from './P2PCanvas';

export default function DashboardView() {
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
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="display-title">Decentralized Governance</h1>
        <p className="display-subtitle">
          Real-time cryptographic consensus powered by Go, zero-knowledge proofs, and multi-peer fault tolerance.
        </p>
      </div>

      {/* Stats Bento Grid */}
      <div className="stats-bento">
        <div className="stat-cell">
          <div className="stat-caption">Block Height</div>
          <div className="stat-number">{blocks.length}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-caption">Mempool Pending</div>
          <div className="stat-number" style={{ color: mempool.length > 0 ? 'var(--apple-orange)' : '#fff' }}>
            {mempool.length}
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-caption">Verified Ballots</div>
          <div className="stat-number" style={{ color: 'var(--apple-green)' }}>{totalVotes}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-caption">Consensus Peers</div>
          <div className="stat-number" style={{ color: 'var(--apple-blue)' }}>3 Active</div>
        </div>
      </div>

      {/* Network Canvas Sheet */}
      <div className="glass-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Peer-to-Peer Consensus Mesh</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Simulated Byzantine fault-tolerant multi-node network (Alpha, Beta, Gamma).
            </p>
          </div>
          <button
            className="apple-btn apple-btn-primary"
            onClick={handleMine}
            disabled={isMining || mempool.length === 0}
            style={{ opacity: mempool.length === 0 ? 0.6 : 1 }}
          >
            {isMining ? 'Mining PoW Nonce...' : `Seal ${mempool.length} Pending Votes`}
          </button>
        </div>

        <P2PCanvas />
      </div>

      {/* Live Telemetry Stream */}
      <div className="glass-sheet">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Real-Time Cryptographic Telemetry</h3>
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
