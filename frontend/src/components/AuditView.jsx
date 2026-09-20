import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { auditReceipt, setReceiptInput, clearAudit } from '../store/slices/auditSlice';
import { mineBlock } from '../store/slices/blockchainSlice';

export default function AuditView({ setActiveTab }) {
  const dispatch = useDispatch();
  const { receiptInput, auditResult, isAuditing, error } = useSelector((state) => state.audit);
  const { mempool } = useSelector((state) => state.blockchain);
  const [inputVal, setInputVal] = useState(receiptInput || '');

  useEffect(() => {
    if (receiptInput) {
      setInputVal(receiptInput);
      dispatch(auditReceipt(receiptInput));
    }
  }, [receiptInput, dispatch]);

  const handleAudit = (e) => {
    e.preventDefault();
    const hash = inputVal.trim();
    if (!hash) return;
    dispatch(setReceiptInput(hash));
    dispatch(auditReceipt(hash));
  };

  const handleMineAndRetry = async () => {
    await dispatch(mineBlock());
    if (inputVal.trim()) {
      dispatch(auditReceipt(inputVal.trim()));
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">VVPAT Ballot Auditor (डिजिटल मतपर्ची सत्यापन)</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Just like the physical VVPAT paper slip displayed at EVM booths, you can independently verify that your ballot is locked in the blockchain ledger without revealing who you are.
        </p>
      </div>

      <div className="glass-sheet">
        <form onSubmit={handleAudit}>
          <div className="apple-field-group">
            <label className="apple-label">VVPAT Ballot Receipt Hash / मतपर्ची रसीद संख्या (SHA3-256)</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="apple-input mono"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter 64-character ballot transaction receipt hash..."
                style={{ flex: 1, minWidth: '280px' }}
                required
              />
              <button
                type="submit"
                className="apple-btn apple-btn-primary"
                disabled={isAuditing}
                style={{ minWidth: '150px' }}
              >
                {isAuditing ? 'Checking Ledger...' : 'Verify Proof (पर्ची जांचें)'}
              </button>
            </div>
            <div className="apple-hint">
              Mathematically confirms your ballot was aggregated into the block's published Merkle root.
            </div>
          </div>
        </form>

        {error && (
          <div style={{
            background: 'rgba(255, 69, 58, 0.12)',
            border: '1px solid rgba(255, 69, 58, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--apple-red)', marginBottom: '6px' }}>
              ⚠️ Receipt Not Found in Ledger
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {error}. If you just cast a ballot, it may still reside in the mempool waiting to be mined into a block!
            </p>
            {mempool.length > 0 && (
              <button
                className="apple-btn apple-btn-success"
                onClick={handleMineAndRetry}
                style={{ marginTop: '12px', fontSize: '0.85rem' }}
              >
                Mine Pending Block Now ({mempool.length} Votes in Mempool)
              </button>
            )}
          </div>
        )}

        {/* Verified Audit Presentation */}
        {auditResult && auditResult.verified && (
          <div style={{ marginTop: '28px' }}>
            <div style={{
              background: 'rgba(52, 199, 89, 0.12)',
              border: '1px solid rgba(52, 199, 89, 0.3)',
              borderRadius: '18px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--apple-green)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                  Cryptographically Verified Inclusion
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                This receipt is mathematically confirmed in <strong>Block #{auditResult.block_index}</strong>. The candidate selection and transaction cannot be tampered with or revoked without invalidating the entire blockchain.
              </p>
            </div>

            {/* Block & Proof Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="stat-cell">
                <div className="stat-caption">Block Index</div>
                <div className="stat-number">#{auditResult.block_index}</div>
              </div>
              <div className="stat-cell">
                <div className="stat-caption">Candidate Recorded</div>
                <div className="stat-number" style={{ fontSize: '1.4rem', color: 'var(--apple-blue)' }}>
                  {auditResult.candidate_id}
                </div>
              </div>
              <div className="stat-cell">
                <div className="stat-caption">Merkle Path Steps</div>
                <div className="stat-number" style={{ color: 'var(--apple-green)' }}>
                  {auditResult.proof ? auditResult.proof.length : 0} Nodes
                </div>
              </div>
            </div>

            {/* Visual Merkle Tree Path */}
            <div style={{
              background: 'rgba(12, 12, 16, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px' }}>
                Merkle Inclusion DAG Path
              </h4>

              {/* Merkle Root Node */}
              <div style={{
                background: 'rgba(0, 113, 227, 0.15)',
                border: '1px solid var(--apple-blue)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
                  [ROOT] Block #{auditResult.block_index} Merkle Root
                </div>
                <div className="mono" style={{ fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all', marginTop: '4px' }}>
                  {auditResult.merkle_root}
                </div>
              </div>

              {/* Intermediate Sibling Hashes */}
              {auditResult.proof && auditResult.proof.map((step, idx) => (
                <div key={idx} style={{
                  marginLeft: '24px',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.15)',
                  paddingLeft: '16px',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Step {idx + 1}: Hash Sibling ({step.is_left ? 'Left' : 'Right'} Neighbor)
                    </div>
                    <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--apple-gray)', wordBreak: 'break-all', marginTop: '2px' }}>
                      {step.sibling_hash}
                    </div>
                  </div>
                </div>
              ))}

              {/* Target Leaf Node */}
              <div style={{
                marginLeft: '48px',
                background: 'rgba(52, 199, 89, 0.15)',
                border: '1px solid var(--apple-green)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--apple-green)', textTransform: 'uppercase' }}>
                  [TARGET LEAF] Verified Ballot Receipt
                </div>
                <div className="mono" style={{ fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all', marginTop: '4px' }}>
                  {auditResult.receipt_hash}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
