import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCandidate } from '../store/slices/electionsSlice';
import { castBallot, resetVoteState, setVoterSecretDirect } from '../store/slices/voterSlice';
import { setReceiptInput } from '../store/slices/auditSlice';

export default function VotingView({ setActiveTab }) {
  const dispatch = useDispatch();
  const { currentElection, selectedCandidateId } = useSelector((state) => state.elections);
  const { voterSecret, isSubmittingVote, voteSuccess, voteError, lastReceiptHash, verified } = useSelector((state) => state.voter);
  const [manualSecret, setManualSecret] = useState(voterSecret || '');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    if (voterSecret) {
      setManualSecret(voterSecret);
    }
  }, [voterSecret]);

  const handleCastVote = (e) => {
    e.preventDefault();
    if (!currentElection) return;
    if (!selectedCandidateId) {
      alert('Please select a candidate to vote for.');
      return;
    }
    const secretToUse = manualSecret.trim() || voterSecret;
    if (!secretToUse) {
      alert('Please complete Aadhaar KYC or enter your Voter Secret Key.');
      return;
    }

    dispatch(castBallot({
      election_id: currentElection.id,
      candidate_id: selectedCandidateId,
      voter_secret: secretToUse
    }));
  };

  const handleAuditClick = () => {
    dispatch(setReceiptInput(lastReceiptHash));
    setActiveTab('audit');
  };

  const copyReceipt = () => {
    navigator.clipboard.writeText(lastReceiptHash);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  // Calculate total votes for relative percentage bars
  const totalElectionVotes = currentElection?.candidates?.reduce((acc, c) => acc + (c.vote_count || 0), 0) || 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="display-title">EVM Voting Booth / डिजिटल मतदान केंद्र</h1>
        <p className="display-subtitle" style={{ margin: '0 auto' }}>
          Select your candidate and press the Blue Button. Your ballot is sealed cryptographically — 100% secret, tamper-proof, and verifiable.
        </p>
      </div>

      {voteSuccess && (
        <div className="apple-wallet-pass" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Vote Recorded Successfully • VVPAT Generated
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                Digital VVPAT Ballot Receipt (डिजिटल मतपर्ची)
              </h3>
            </div>
            <span className="status-pill" style={{ background: 'rgba(52, 199, 89, 0.2)' }}>
              VOTE SECURED (मतदान सफल)
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
            Just like the physical VVPAT paper slip displayed at EVM booths, this receipt hash lets you verify your vote in the public ledger without ever revealing your personal identity.
          </p>

          <div className="pass-seed-box" style={{ wordBreak: 'break-all' }}>
            <span style={{ color: 'var(--apple-blue)', marginRight: '8px' }}>VVPAT RECEIPT HASH:</span>
            {lastReceiptHash}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="apple-btn apple-btn-primary" onClick={handleAuditClick}>
              Audit in VVPAT Explorer (पर्ची जांचें) →
            </button>
            <button className="apple-btn apple-btn-secondary" onClick={copyReceipt}>
              {copiedReceipt ? '✓ Copied' : 'Copy Hash'}
            </button>
            <button className="apple-btn apple-btn-secondary" onClick={() => dispatch(resetVoteState())}>
              Cast Another Demo Vote
            </button>
          </div>
        </div>
      )}

      {voteError && (
        <div style={{
          background: 'rgba(255, 69, 58, 0.12)',
          border: '1px solid rgba(255, 69, 58, 0.3)',
          borderRadius: '16px',
          padding: '18px 22px',
          marginBottom: '24px',
          color: '#ff6961'
        }}>
          <strong>⚠️ Ballot Rejected:</strong> {voteError}
        </div>
      )}

      {/* Candidate Selection Shelf */}
      <div className="glass-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{currentElection?.title || 'Active Election'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Select your candidate to formulate the zero-knowledge ballot payload.
            </p>
          </div>
          <div className="status-pill">
            TOTAL VOTES: {totalElectionVotes}
          </div>
        </div>

        <div className="candidates-shelf">
          {currentElection?.candidates?.map((candidate) => {
            const isSelected = selectedCandidateId === candidate.id;
            const pct = totalElectionVotes > 0 ? Math.round((candidate.vote_count / totalElectionVotes) * 100) : 0;

            return (
              <div
                key={candidate.id}
                className={`candidate-card-apple ${isSelected ? 'selected' : ''}`}
                onClick={() => dispatch(selectCandidate(candidate.id))}
              >
                <div className="avatar-circle">
                  <img
                    src={candidate.image_url || '/static/img/amit_thaker.jpeg'}
                    alt={candidate.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop';
                    }}
                  />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{candidate.name}</h4>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--apple-blue)', marginTop: '2px' }}>
                  {candidate.party}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', flex: 1 }}>
                  {candidate.bio}
                </p>

                {/* Live Tally Bar */}
                <div style={{ width: '100%', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    <span>Live Tallies</span>
                    <span>{candidate.vote_count} votes ({pct}%)</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: isSelected ? 'var(--apple-blue)' : 'rgba(255, 255, 255, 0.4)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                <div style={{ marginTop: '14px', width: '100%' }}>
                  <button
                    type="button"
                    className="apple-btn"
                    style={{
                      width: '100%',
                      fontSize: '0.86rem',
                      background: isSelected ? 'var(--apple-blue)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: isSelected ? '1px solid #0071e3' : '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {isSelected ? '✓ Selected (चुना गया)' : '🔘 Select Candidate / चुनें'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voter Secret Key Input */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="apple-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="apple-label" style={{ margin: 0 }}>Voter Secret Passkey / मतदाता गुप्त कुंजी (From Voter Slip)</label>
              {!verified && (
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--apple-blue)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Get Slip via Aadhaar (मतदाता पर्ची पाएं) →
                </button>
              )}
            </div>
            <input
              type="text"
              className="apple-input mono"
              value={manualSecret}
              onChange={(e) => {
                setManualSecret(e.target.value);
                dispatch(setVoterSecretDirect(e.target.value));
              }}
              placeholder="e.g. 9b6e82813589b2b5424cf3c4a45610ec87870a6d..."
              required
            />
            <div className="apple-hint">
              Used to sign your ballot without revealing your identity. Ensures exactly 1-Citizen = 1-Vote.
            </div>
          </div>

          <button
            type="button"
            className="apple-btn apple-btn-primary"
            onClick={handleCastVote}
            disabled={isSubmittingVote || !selectedCandidateId}
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '8px', fontWeight: 700 }}
          >
            {isSubmittingVote ? 'Recording Ballot in Blockchain...' : '🔘 PRESS BLUE BUTTON TO VOTE / नीला बटन दबाकर मत दें'}
          </button>
        </div>
      </div>
    </div>
  );
}
