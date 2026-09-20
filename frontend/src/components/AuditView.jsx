import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReceiptInput, auditReceipt, clearAudit } from '../store/slices/auditSlice';
import { IconClockPending, IconWarningTriangle, IconCheck } from './icons';

export default function AuditView() {
  const dispatch = useDispatch();
  const { receiptInput, auditResult, isAuditing, error } = useSelector((state) => state.audit);
  const { mempool } = useSelector((state) => state.blockchain);

  const handleAudit = (e) => {
    e.preventDefault();
    if (!receiptInput.trim()) return;
    dispatch(auditReceipt(receiptInput.trim()));
  };

  const handleClear = () => {
    dispatch(clearAudit());
  };

  const isPendingInMempool = mempool.some(
    (tx) => tx.receipt_hash === receiptInput.trim()
  );

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">VVPAT Ballot Auditor (Vote Parchi Verify Karo)</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Apni VVPAT receipt hash yahan daalein aur check karein ki aapka vote blockchain ke kis block me securely count hua hai.
        </p>
      </div>

      <div className="glass-sheet" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleAudit}>
          <div className="apple-field-group">
            <label className="apple-label">
              VVPAT Receipt Hash (Aapki Vote Parchi Ka Code)
            </label>
            <input
              type="text"
              className="apple-input mono"
              value={receiptInput}
              onChange={(e) => dispatch(setReceiptInput(e.target.value))}
              placeholder="Enter 64-character ballot transaction receipt hash..."
              required
            />
            <div className="apple-hint">
              Yeh hash vote daalne ke baad VVPAT slip par display hoti hai. Isse verify hota hai ki aapka vote safe hai.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="apple-btn apple-btn-primary"
              disabled={isAuditing}
              style={{ flex: 2 }}
            >
              {isAuditing ? 'Auditing Merkle Proof...' : 'Verify Proof (Parchi Verify Karo)'}
            </button>
            {receiptInput && (
              <button
                type="button"
                className="apple-btn apple-btn-secondary"
                onClick={handleClear}
                style={{ flex: 1 }}
              >
                Clear (Saaf Karein)
              </button>
            )}
          </div>
        </form>
      </div>

      {isPendingInMempool && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'rgba(255, 159, 10, 0.15)',
          border: '1px solid rgba(255, 159, 10, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          color: 'var(--apple-amber)'
        }}>
          <IconClockPending size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span><strong>Ballot In Queue (Vote Abhi Queue Me Hai):</strong> Aapka vote mempool me safely staged hai aur agle block me seal hokar count ho jayega.</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'rgba(255, 69, 58, 0.15)',
          border: '1px solid rgba(255, 69, 58, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          color: 'var(--apple-red)'
        }}>
          <IconWarningTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span><strong>Verification Failed:</strong> {error}</span>
        </div>
      )}

      {auditResult && auditResult.verified && (
        <div className="apple-wallet-pass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--apple-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Mathematical Proof Verified (Proof Sahi Paaya Gaya)
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                Cryptographically Verified Inclusion (Vote Safe Hai)
              </h3>
            </div>
            <span className="status-pill" style={{ background: 'rgba(48, 209, 88, 0.2)' }}>
              <IconCheck size={12} /> PERMANENTLY RECORDED
            </span>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '16px',
            margin: '18px 0',
            fontSize: '0.85rem',
            lineHeight: '1.8'
          }}>
            <div><strong>Sealed in Block Index:</strong> #{auditResult.block_index}</div>
            <div><strong>Candidate ID Voted:</strong> #{auditResult.candidate_id}</div>
          </div>

          {/* Visual Merkle DAG Branch */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Merkle Inclusion DAG Path (Proof Ka Raasta):
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Root */}
              <div style={{
                background: 'rgba(0, 113, 227, 0.15)',
                border: '1px solid var(--apple-blue)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.82rem'
              }}>
                <div style={{ color: 'var(--apple-blue)', fontWeight: 700 }}>Block #{auditResult.block_index} Merkle Root</div>
                <div className="mono" style={{ wordBreak: 'break-all', fontSize: '0.78rem', color: '#fff' }}>
                  {auditResult.merkle_root}
                </div>
              </div>

              {/* Steps */}
              {auditResult.proof && auditResult.proof.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    marginLeft: '20px',
                    borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                    paddingLeft: '14px',
                    paddingTop: '6px',
                    paddingBottom: '6px'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Step {idx + 1}: Hash Sibling ({p.is_left ? 'Left' : 'Right'})
                  </div>
                  <div className="mono" style={{ wordBreak: 'break-all', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {p.sibling_hash}
                  </div>
                </div>
              ))}

              {/* Leaf Receipt */}
              <div style={{
                background: 'rgba(48, 209, 88, 0.15)',
                border: '1px solid var(--apple-green)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                marginLeft: '20px'
              }}>
                <div style={{ color: 'var(--apple-green)', fontWeight: 700 }}>Verified Ballot Receipt (Aapka Vote)</div>
                <div className="mono" style={{ wordBreak: 'break-all', fontSize: '0.78rem', color: '#fff' }}>
                  {auditResult.receipt_hash}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
