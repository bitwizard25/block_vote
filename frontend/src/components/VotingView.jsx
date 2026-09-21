import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import gsap from 'gsap';
import { selectCandidate } from '../store/slices/electionsSlice';
import { castBallot, resetVoteState, setVoterSecretDirect } from '../store/slices/voterSlice';
import { setReceiptInput } from '../store/slices/auditSlice';
import NumberFlow from '@number-flow/react';
import { IconEmblem, IconCheck, IconWarningTriangle, IconReceiptLarge, IconInfoCircle, IconArrowRight, IconDot } from './icons';
import { getPartySymbolIcon } from './partySymbols';

export default function VotingView({ setActiveTab }) {
  const dispatch = useDispatch();
  const { currentElection, selectedCandidateId } = useSelector((state) => state.elections);
  const { voterSecret, isSubmittingVote, voteSuccess, voteError, lastReceiptHash, verified } = useSelector((state) => state.voter);
  const [manualSecret, setManualSecret] = useState(voterSecret || '');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const successCardRef = useRef(null);
  const successPillRef = useRef(null);
  const receiptBoxRef = useRef(null);

  useEffect(() => {
    if (voterSecret) {
      setManualSecret(voterSecret);
    }
  }, [voterSecret]);

  // Vote-cast is rare and high-stakes (once per citizen), so it earns a fuller
  // orchestrated payoff: the confirmation card, the "secured" pill and the
  // VVPAT receipt reveal stagger in as one GSAP sequence instead of popping in
  // together. Reduced-motion keeps the reveal but drops the movement/overshoot.
  useEffect(() => {
    if (!voteSuccess) return;
    const card = successCardRef.current;
    if (!card) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (reduceMotion) {
        tl.from(card, { opacity: 0, duration: 0.3, ease: 'power1.out' })
          .from(successPillRef.current, { opacity: 0, duration: 0.25, ease: 'power1.out' }, '-=0.05')
          .from(receiptBoxRef.current, { opacity: 0, duration: 0.25, ease: 'power1.out' }, '-=0.05');
      } else {
        tl.from(card, { opacity: 0, y: 24, duration: 0.5, ease: 'back.out(1.7)' })
          .from(successPillRef.current, { opacity: 0, scale: 0.85, duration: 0.35, ease: 'back.out(1.7)' }, '-=0.25')
          .fromTo(receiptBoxRef.current,
            { opacity: 0.4, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' },
            '-=0.1'
          );
      }
    });

    return () => ctx.revert();
  }, [voteSuccess]);

  const handleCastVote = (e) => {
    if (e) e.preventDefault();
    if (!currentElection) return;
    if (!selectedCandidateId) {
      alert('Kripya pehle kisi candidate ko chunein (Please select a candidate).');
      return;
    }
    const secretToUse = manualSecret.trim() || voterSecret;
    if (!secretToUse) {
      alert('Pehle Aadhaar verify karke apni Voter Slip lein ya apna Voter Secret Passkey daalein.');
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

  const totalElectionVotes = currentElection?.candidates?.reduce((acc, c) => acc + (c.vote_count || 0), 0) || 0;
  const selectedCandidateObj = currentElection?.candidates?.find(c => c.id === selectedCandidateId);


  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
      {/* Voter Journey Progress Tracker */}
      <div className="voter-journey-strip">
        <div className={`journey-step-item ${verified ? 'done' : 'active'}`}>
          <div className="journey-step-badge">1</div>
          <div>
            <div>1. Get Voter Slip</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Pehle Slip Lo</div>
          </div>
        </div>
        <div className="journey-arrow"><IconArrowRight size={14} /></div>
        <div className={`journey-step-item ${voteSuccess ? 'done' : (selectedCandidateId ? 'active' : '')}`}>
          <div className="journey-step-badge">2</div>
          <div>
            <div>2. Press Blue Button</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Neela Button Dabao</div>
          </div>
        </div>
        <div className="journey-arrow"><IconArrowRight size={14} /></div>
        <div className={`journey-step-item ${voteSuccess ? 'active' : ''}`}>
          <div className="journey-step-badge">3</div>
          <div>
            <div>3. Verify VVPAT Receipt</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Parchi Check Karo</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 className="display-title">EVM Voting Booth • Vote Daalo Yahan</h1>
        <p className="display-subtitle">
          EVM Ballot Unit me apne manpasand candidate ko select karein aur Neela Button dabayein. Aapka vote 100% secret aur blockchain pe permanently seal hoga.
        </p>
      </div>

      {/* Success VVPAT Slip Card */}
      {voteSuccess && (
        <div className="apple-wallet-pass" style={{ marginBottom: '28px' }} ref={successCardRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--apple-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Vote Recorded Successfully • VVPAT Slip Generated
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                Digital VVPAT Ballot Receipt (Aapki Digital Matdata Parchi)
              </h3>
            </div>
            <span className="status-pill" style={{ background: 'rgba(48, 209, 88, 0.18)' }} ref={successPillRef}>
              <IconCheck size={12} /> VOTE SECURED (Vote Safalta Se Seal Hua)
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '12px', lineHeight: 1.6 }}>
            Jaise physical EVM booth me VVPAT paper slip 7 seconds ke liye dikhti hai, waise hi yeh cryptographic receipt hash confirm karti hai ki aapka vote ledger me count ho chuka hai, bina aapka naam ya identity reveal kiye.
          </p>

          <div className="pass-seed-box" style={{ wordBreak: 'break-all' }} ref={receiptBoxRef}>
            <span style={{ color: 'var(--apple-blue)', marginRight: '8px' }}>VVPAT RECEIPT HASH:</span>
            {lastReceiptHash}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="apple-btn apple-btn-primary" onClick={handleAuditClick}>
              Audit in VVPAT Explorer (Parchi Check Karo) <IconArrowRight size={13} />
            </button>
            <button className="apple-btn apple-btn-secondary" onClick={copyReceipt}>
              {copiedReceipt ? <><IconCheck size={12} /> Copied</> : 'Copy Hash'}
            </button>
            <button className="apple-btn apple-btn-secondary" onClick={() => dispatch(resetVoteState())}>
              Cast Another Demo Vote (Dusra Demo Vote Daalo)
            </button>
          </div>
        </div>
      )}

      {voteError && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'rgba(255, 69, 58, 0.12)',
          border: '1px solid rgba(255, 69, 58, 0.3)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#ff6961'
        }}>
          <IconWarningTriangle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span><strong>Ballot Rejected / Vote Reject Hua:</strong> {voteError}</span>
        </div>
      )}

      {/* Main EVM Station Grid */}
      <div className="evm-station-container">
        {/* Left Column: Official EVM Ballot Unit */}
        <div className="evm-ballot-casing">
          <div className="evm-casing-header">
            <div className="evm-casing-title">
              <IconEmblem size={16} />
              <span>ELECTION COMMISSION OF INDIA • BALLOT UNIT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="status-pill" style={{ fontSize: '0.72rem' }}>
                TOTAL VOTES: <NumberFlow value={totalElectionVotes} />
              </span>
              <div className="evm-ready-indicator">
                <span className="pulse-dot"></span>
                <span>READY (Taiyaar)</span>
              </div>
            </div>
          </div>

          {/* Subheader info */}
          <div style={{
            padding: '10px 18px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <span>Constituency: <strong>{currentElection?.title || 'Lok Sabha 2026'}</strong></span>
            <span>Ballot Unit #01</span>
          </div>

          {/* Candidates Rows */}
          <div className="evm-candidate-list">
            {currentElection?.candidates?.map((candidate, idx) => {
              const isSelected = selectedCandidateId === candidate.id;
              const pct = totalElectionVotes > 0 ? Math.round((candidate.vote_count / totalElectionVotes) * 100) : 0;

              return (
                <div
                  key={candidate.id}
                  className={`evm-candidate-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => dispatch(selectCandidate(candidate.id))}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Serial Number */}
                  <div className="evm-serial-badge">{idx + 1}</div>

                  {/* Photo */}
                  <div className="evm-photo-thumb">
                    <img
                      src={candidate.image_url || `/static/img/candidate_${candidate.id}.jpg`}
                      alt={candidate.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop';
                      }}
                    />
                  </div>

                  {/* Candidate & Party info */}
                  <div className="evm-details-col">
                    <div className="evm-cand-name">{candidate.name}</div>
                    <div className="evm-party-name">{candidate.party}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {candidate.bio}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: '6px', maxWidth: '280px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                        <span>Live Votes: <NumberFlow value={candidate.vote_count} /></span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isSelected ? 'var(--apple-blue)' : 'rgba(255,255,255,0.3)', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  </div>

                  {/* Party Symbol Tile */}
                  <div className="evm-symbol-box" title={`Election Symbol: ${candidate.party}`}>
                    {getPartySymbolIcon(candidate, { size: 26 })}
                  </div>

                  {/* LED Lamp */}
                  <div>
                    <div className={`evm-led-lamp ${isSelected ? 'glowing' : ''}`} title={isSelected ? 'Selected' : 'Inactive'} />
                  </div>

                  {/* Blue Button */}
                  <div>
                    <button
                      type="button"
                      className="evm-blue-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(selectCandidate(candidate.id));
                      }}
                      style={{ width: '100%' }}
                    >
                      {isSelected ? <><IconCheck size={13} /> SELECTED</> : <><IconDot size={9} /> VOTE KAREIN / VOTE</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voter Secret Passkey Input & Final Blue Vote Button */}
          <div style={{
            padding: '22px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div className="apple-field-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="apple-label" style={{ margin: 0 }}>
                  Voter Secret Passkey (Voter Slip Se Mili Secret Key)
                </label>
                {!verified && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    style={{ background: 'none', border: 'none', color: 'var(--apple-blue)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Aadhaar Se Slip Lo →
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
                Yeh secret passkey aapke ballot ko cryptographically sign karta hai, taaki aapka Aadhaar ya naam ledger me expose na ho.
              </div>
            </div>

            <button
              type="button"
              className="evm-blue-btn"
              onClick={handleCastVote}
              disabled={isSubmittingVote || !selectedCandidateId}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.05rem',
                letterSpacing: '0.02em',
                borderRadius: '14px'
              }}
            >
              {isSubmittingVote ? 'Blockchain Me Vote Seal Ho Raha Hai...' : <><IconDot size={11} /> PRESS BLUE BUTTON TO VOTE / Neela Button Dabakar Vote Karein</>}
            </button>
          </div>
        </div>

        {/* Right Column: VVPAT Optical Display & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* VVPAT Glass Display Window */}
          <div className="vvpat-display-casing">
            <div className="vvpat-casing-badge">
              <span>VVPAT OPTICAL DISPLAY</span>
              <span>Parchi Khidki</span>
            </div>

            <div className="vvpat-glass-window">
              <div className="vvpat-glass-glare"></div>
              {selectedCandidateObj ? (
                <div className="vvpat-paper-slip">
                  <div className="slip-header">
                    ELECTION COMMISSION OF INDIA • VVPAT
                  </div>
                  <div className="slip-body">
                    <div>
                      <div className="slip-cand-name">{selectedCandidateObj.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#555' }}>{selectedCandidateObj.party}</div>
                    </div>
                    <div className="slip-symbol">{getPartySymbolIcon(selectedCandidateObj, { size: 24 })}</div>
                  </div>
                  <div className="slip-hash-box">
                    {lastReceiptHash ? (
                      <>
                        <strong>SEALED RECEIPT:</strong><br />
                        {lastReceiptHash.substring(0, 24)}...
                      </>
                    ) : (
                      <>
                        <strong>READY TO PRINT:</strong><br />
                        Neela Button Dabao
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', opacity: 0.5 }}>
                    <IconReceiptLarge size={34} />
                  </div>
                  EVM ballot unit me candidate select karein, VVPAT paper slip yahan dikhegi.
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.4 }}>
              VVPAT slip aapke vote ki confirmation hai. Yeh automatically hash hokar Merkle tree me seal ho jaati hai.
            </div>
          </div>

          {/* Quick Helper Guide Card in Hinglish */}
          <div className="glass-sheet" style={{ padding: '18px', margin: 0 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
              <IconInfoCircle size={15} style={{ color: 'var(--apple-blue)' }} /> Voting Kaise Karein (Easy Steps)
            </h4>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li>Apne pasandida candidate ke naam ya chunav chinha (symbol) par click karein.</li>
              <li>Aapki <strong>Voter Secret Passkey</strong> automatically fill ho jayegi.</li>
              <li>Neeche diya gaya <strong>Neela Button (Blue Button)</strong> dabayein.</li>
              <li>Aapka vote ledger me count ho jayega aur ek person sirf ek baar vote kar sakta hai.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
