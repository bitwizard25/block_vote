import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNodeStatus, simulateTamper, healNode } from '../store/slices/blockchainSlice';

export default function AttackSandboxView() {
  const dispatch = useDispatch();
  const { nodeStatus } = useSelector((state) => state.blockchain);
  const [actionMessage, setActionMessage] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    dispatch(fetchNodeStatus());
  }, [dispatch]);

  const handleTamper = async () => {
    setLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await dispatch(simulateTamper()).unwrap();
      setActionMessage({ type: 'danger', text: res.message || 'Malicious tamper injected into Node-Alpha!' });
      dispatch(fetchNodeStatus());
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleHeal = async () => {
    setLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await dispatch(healNode()).unwrap();
      setActionMessage({ type: 'success', text: res.message || 'Node-Alpha successfully restored from majority consensus ledger!' });
      dispatch(fetchNodeStatus());
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Build list of node cards (supporting both Node-Alpha and alpha keys)
  const defaultNodes = [
    { id: 'Node-Alpha', alias: 'alpha', name: 'Node-Alpha', role: 'Mining / Validator Node' },
    { id: 'Node-Beta', alias: 'beta', name: 'Node-Beta', role: 'Consensus Peer & Auditor' },
    { id: 'Node-Gamma', alias: 'gamma', name: 'Node-Gamma', role: 'Consensus Peer & Auditor' },
  ];

  const alphaStatus = nodeStatus?.['Node-Alpha'] || nodeStatus?.alpha || {};
  const hasTamper = alphaStatus.tampered === true;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">Election Security & Anti-Tamper Verification (सुरक्षा व निष्पक्षता जांच)</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Real-time EVM fault-tolerance. See what happens if an individual polling server is attacked or corrupted, and watch the honest majority observer nodes instantly detect and auto-heal the election record.
        </p>
      </div>

      {actionMessage && (
        <div style={{
          background: actionMessage.type === 'danger' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(52, 199, 89, 0.15)',
          border: `1px solid ${actionMessage.type === 'danger' ? 'var(--apple-red)' : 'var(--apple-green)'}`,
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{actionMessage.type === 'danger' ? '⚠️' : '🛡️'}</span>
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Peer Nodes 3-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {defaultNodes.map((node) => {
          const info = nodeStatus?.[node.id] || nodeStatus?.[node.alias] || {};
          const isTampered = info.tampered;

          return (
            <div
              key={node.id}
              className="glass-sheet"
              style={{
                margin: 0,
                border: isTampered ? '2px solid var(--apple-red)' : '1px solid var(--material-border)',
                boxShadow: isTampered ? '0 10px 30px rgba(255, 69, 58, 0.3)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{node.name}</h3>
                <span
                  className="status-pill"
                  style={{
                    background: isTampered ? 'rgba(255, 69, 58, 0.2)' : 'rgba(52, 199, 89, 0.15)',
                    color: isTampered ? 'var(--apple-red)' : 'var(--apple-green)',
                    borderColor: isTampered ? 'rgba(255, 69, 58, 0.4)' : 'rgba(52, 199, 89, 0.3)'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isTampered ? 'var(--apple-red)' : 'var(--apple-green)',
                      display: 'inline-block',
                      boxShadow: isTampered ? '0 0 8px var(--apple-red)' : '0 0 8px var(--apple-green)'
                    }}
                  />
                  {isTampered ? 'BYZANTINE CORRUPT' : 'SYNCHRONIZED'}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {node.role}
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '14px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Height:</span>{' '}
                  <strong style={{ color: '#fff' }}>{info.height ?? '0'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Latest Hash:</span>
                  <div style={{
                    color: isTampered ? 'var(--apple-red)' : 'var(--apple-blue)',
                    wordBreak: 'break-all',
                    fontSize: '0.75rem',
                    marginTop: '2px'
                  }}>
                    {info.latest_hash ? `${info.latest_hash.substring(0, 24)}...` : 'Synchronizing...'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Actions Sheet */}
      <div className="glass-sheet">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Fault Injection & Consensus Orchestration</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Simulate an adversarial attack where a rogue validator tries to rewrite historical blocks or alter election tallies.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            className="apple-btn apple-btn-danger"
            onClick={handleTamper}
            disabled={loadingAction || hasTamper}
            style={{ flex: 1, minWidth: '220px', padding: '14px' }}
          >
            {loadingAction ? 'Executing...' : 'Corrupt Node-Alpha Ledger (Attack)'}
          </button>

          <button
            className="apple-btn apple-btn-success"
            onClick={handleHeal}
            disabled={loadingAction || !hasTamper}
            style={{ flex: 1, minWidth: '220px', padding: '14px', opacity: !hasTamper ? 0.6 : 1 }}
          >
            {loadingAction ? 'Synchronizing...' : 'Consensus Auto-Heal from Majority'}
          </button>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>How BlockVote Prevents 51% & Byzantine Attacks:</strong> Each node cryptographically cross-validates every incoming block hash, previous block reference, and Merkle root against its peers. In a 3-node mesh, if 1 node reports an inconsistent block hash, the remaining 2/3 majority rejects the invalid chain and automatically overwrites the compromised peer with the canonical ledger.
        </div>
      </div>
    </div>
  );
}
