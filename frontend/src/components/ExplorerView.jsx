import React, { useState } from 'react';
import { useSelector } from 'react-redux';

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
    <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">Public Vote Ledger & Counting (पारदर्शी मतगणना)</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Open public election journal. Every citizen, political party, and election observer can verify the mathematical integrity of every sealed ballot block in real time.
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
                    {isExpanded ? 'Hide Details ▲' : 'Inspect Block ▼'}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.86rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <span className="stat-caption">Previous Hash</span>
                      <div className="mono" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                        {block.prev_hash || '0000000000000000000000000000000000000000000000000000000000000000'}
                      </div>
                    </div>
                    <div>
                      <span className="stat-caption">Merkle Root</span>
                      <div className="mono" style={{ color: 'var(--apple-blue)', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                        {block.merkle_root}
                      </div>
                    </div>
                    <div>
                      <span className="stat-caption">Proof of Work Nonce</span>
                      <div className="mono" style={{ color: '#fff' }}>
                        {block.nonce} (Difficulty: {block.difficulty})
                      </div>
                    </div>
                  </div>

                  {/* Transactions list */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>
                    Included Sealed Transactions ({txCount})
                  </h4>

                  {txCount === 0 ? (
                    <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      No vote transactions in this block (System Anchor).
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {block.transactions.map((tx) => (
                        <div
                          key={tx.id || tx.receipt_hash}
                          style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '14px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--apple-blue)' }}>RECEIPT HASH: {tx.receipt_hash}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>{new Date(tx.timestamp * 1000).toLocaleTimeString()}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', color: 'var(--text-secondary)' }}>
                            <div>Candidate: <strong style={{ color: '#fff' }}>{tx.candidate_id}</strong></div>
                            <div>Nullifier: <span style={{ color: 'var(--apple-orange)' }}>{tx.nullifier ? tx.nullifier.substring(0, 16) + '...' : 'N/A'}</span></div>
                            <div>Election: {tx.election_id}</div>
                          </div>
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
