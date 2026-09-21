import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IconChevronUp, IconChevronDown, IconCheck } from './icons';

export default function ExplorerView() {
  const { blocks } = useSelector((state) => state.blockchain);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBlockIndex, setExpandedBlockIndex] = useState(null);

  const reversedBlocks = [...blocks].reverse();

  const filteredBlocks = reversedBlocks.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.hash.toLowerCase().includes(term) ||
      b.merkle_root.toLowerCase().includes(term) ||
      String(b.index).includes(term)
    );
  });

  const toggleExpand = (index) => {
    setExpandedBlockIndex(expandedBlockIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">Public Vote Ledger & Counting (Sabka Khula Khata)</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Khula public election journal. Har citizen, candidate aur observer har block aur vote ki mathematical proof real time me verify kar sakta hai.
        </p>
      </div>

      <div className="glass-sheet" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            className="apple-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blocks by hash, index, or Merkle root..."
            style={{ flex: 1 }}
          />
          <div className="status-pill" style={{ whiteSpace: 'nowrap' }}>
            {blocks.length} BLOCKS MINED
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredBlocks.map((block) => {
          const isExpanded = expandedBlockIndex === block.index;
          const isGenesis = block.index === 0;
          const txCount = block.transactions ? block.transactions.length : 0;
          const blockDate = new Date(block.timestamp * 1000).toLocaleString();

          return (
            <div key={block.hash || block.index} className="glass-sheet" style={{ margin: 0, padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
                onClick={() => toggleExpand(block.index)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: isGenesis ? 'rgba(94, 92, 230, 0.2)' : 'rgba(0, 113, 227, 0.2)',
                      color: isGenesis ? 'var(--apple-indigo)' : 'var(--apple-blue)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      BLOCK #{block.index} {isGenesis && '• GENESIS'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {blockDate}
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fff', wordBreak: 'break-all' }}>
                    <strong>Hash:</strong> <span style={{ color: 'var(--apple-green)' }}>{block.hash}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="status-pill" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
                    {txCount} {txCount === 1 ? 'TRANSACTION' : 'TRANSACTIONS'}
                  </div>
                  <button className="apple-btn apple-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    {isExpanded ? <>Hide Details <IconChevronUp size={13} /></> : <>Inspect Block <IconChevronDown size={13} /></>}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>PREVIOUS HASH</div>
                      <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        {block.prev_hash || 'None (Genesis Root)'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>MERKLE ROOT</div>
                      <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--apple-blue)', wordBreak: 'break-all' }}>
                        {block.merkle_root}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>POW NONCE & DIFFICULTY</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#fff' }}>
                        Nonce: {block.nonce} • Diff: {block.difficulty}
                      </div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Included Sealed Transactions (Block Me Sealed Votes) ({txCount}):
                  </h4>

                  {txCount === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                      Genesis initialization block (Abhi koi vote nahi hai).
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {block.transactions.map((tx, idx) => (
                        <div
                          key={tx.nullifier || idx}
                          style={{
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--apple-blue)', fontWeight: 600 }}>Ballot #{idx + 1}:</span>{' '}
                            <span>Candidate ID: <strong>{tx.candidate_id}</strong></span>
                            {tx.receipt_hash && (
                              <div className="mono" style={{ color: 'var(--apple-blue)', fontSize: '0.75rem', marginTop: '3px' }}>
                                RECEIPT HASH: {tx.receipt_hash}
                              </div>
                            )}
                            <div className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '3px' }}>
                              Nullifier: {tx.nullifier ? tx.nullifier.substring(0, 24) : '???'}...
                            </div>
                          </div>
                          <span className="status-pill" style={{ fontSize: '0.7rem', background: 'rgba(48, 209, 88, 0.15)', color: 'var(--apple-green)' }}>
                            <IconCheck size={11} /> SEALED VOTE
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
