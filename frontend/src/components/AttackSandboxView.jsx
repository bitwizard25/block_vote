import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNodeStatus, simulateTamper, healNode } from '../store/slices/blockchainSlice';
import { IconWarningTriangle, IconShieldCheck } from './icons';

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

  const defaultNodes = [
    { id: 'Node-Alpha', alias: 'alpha', name: 'Node-Alpha', role: 'Mining / Validator Node' },
    { id: 'Node-Beta', alias: 'beta', name: 'Node-Beta', role: 'Consensus Peer & Auditor' },
    { id: 'Node-Gamma', alias: 'gamma', name: 'Node-Gamma', role: 'Consensus Peer & Auditor' },
  ];

  const alphaStatus = nodeStatus?.['Node-Alpha'] || nodeStatus?.alpha || {};
  const hasTamper = alphaStatus.tampered === true;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">Election Security & Anti-Tamper Verification (Suraksha Lab)</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Real-time fault tolerance test. Dekhein agar koi hacker kisi ek polling node ka data change karne ki koshish kare, toh honest majority nodes usse kaise pakadti aur auto-heal karti hain.
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
          {actionMessage.type === 'danger' ? <IconWarningTriangle size={20} /> : <IconShieldCheck size={20} />}
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
                    background: isTampered ? 'rgba(255, 69, 58, 0.2)' : 'rgba(48, 209, 88, 0.2)',
                    color: isTampered ? 'var(--apple-red)' : 'var(--apple-green)',
                    border: `1px solid ${isTampered ? 'var(--apple-red)' : 'var(--apple-green)'}`
                  }}
                >
                  {isTampered ? 'BYZANTINE CORRUPT' : 'SYNCHRONIZED'}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '14px' }}>
                Role: <strong>{node.role}</strong>
              </p>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div><strong>Honest Peer:</strong> {info.is_honest !== false ? 'Yes (Honest)' : 'No (Compromised)'}</div>
                <div><strong>Blocks Height:</strong> {info.block_height !== undefined ? info.block_height : 0}</div>
                <div><strong>State:</strong> {isTampered ? 'Hash Mismatch / Corrupted' : 'Consensus Active'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls */}
      <div className="double-bezel-wrapper">
        <div className="double-bezel-core">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Interactive Byzantine Fault Tolerance Sandbox (Tamper Test Karo)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
            Click karein aur dekhein ki tamper hone par election system kaise detect karta hai aur auto-heal hota hai.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              className="apple-btn apple-btn-danger"
              onClick={handleTamper}
              disabled={loadingAction || hasTamper}
              style={{ opacity: hasTamper ? 0.5 : 1, flex: 1, minWidth: '220px' }}
            >
              Corrupt Node-Alpha Ledger (Attack Simulate Karo)
            </button>

            <button
              className="apple-btn apple-btn-success"
              onClick={handleHeal}
              disabled={loadingAction || !hasTamper}
              style={{ opacity: !hasTamper ? 0.5 : 1, flex: 1, minWidth: '220px' }}
            >
              Consensus Auto-Heal from Majority (Auto-Heal Karo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
