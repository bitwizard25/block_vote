import React, { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import P2PCanvas from './P2PCanvas';
import { getPartySymbolIcon } from './partySymbols';
import {
  IconEmblem, IconArrowRight, IconCheck, IconDot,
  IconLedger, IconIdCard, IconMesh, IconLock, IconVvpat
} from './icons';

const CTA_ENTER = 'Enter the Voting Portal';

/* ==========================================================================
   LANDING PAGE - public, pre-login surface for BlockVote Bharat.
   Inherits the app's existing OLED civic-hardware design system (tokens,
   EVM/VVPAT motifs, spring easings) rather than introducing a new one.
   ========================================================================== */

function RevealSection({ as: Tag = 'section', className = '', children, ...rest }) {
  const { ref, className: revealClass } = useScrollReveal();
  return (
    <Tag ref={ref} className={`${className} ${revealClass}`} {...rest}>
      {children}
    </Tag>
  );
}

/* A small, real (not faked) Merkle-tree diagram: four leaves resolving to
   one root, illustrating the actual proof structure the ledger uses. */
function MerkleDiagram() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="72" fill="none" aria-hidden="true">
      <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.4">
        <path d="M20 78 L50 46 M80 78 L50 46" />
        <path d="M110 78 L130 46 M150 78 L130 46" />
        <path d="M50 46 L90 16 M130 46 L90 16" />
      </g>
      {[
        [20, 78], [80, 78], [110, 78], [150, 78],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      ))}
      <circle cx="50" cy="46" r="5" fill="rgba(0,113,227,0.25)" stroke="var(--apple-blue)" strokeWidth="1.2" />
      <circle cx="130" cy="46" r="5" fill="rgba(0,113,227,0.25)" stroke="var(--apple-blue)" strokeWidth="1.2" />
      <circle cx="90" cy="16" r="6.5" fill="rgba(48,209,88,0.22)" stroke="var(--apple-green)" strokeWidth="1.6" />
    </svg>
  );
}

/* A real, working, simplified EVM + VVPAT preview built from the exact same
   CSS the live app uses (see index.css .evm-* / .vvpat-*), not a fake
   div-screenshot. Local demo state only, generic candidates so this reads
   as "how the product works," not a specific pretend election. */
function HeroBallotDemo() {
  const demoCandidates = [
    { id: 'a', label: 'Candidate A', party: 'Demo Party', symbol_key: 'scale' },
    { id: 'b', label: 'Candidate B', party: 'Demo Party', symbol_key: 'wheat' },
    { id: 'c', label: 'Candidate C', party: 'Demo Party', symbol_key: 'bulb' },
  ];
  const [selectedId, setSelectedId] = useState(null);
  const [sealed, setSealed] = useState(false);

  const selectedCandidate = demoCandidates.find((c) => c.id === selectedId);

  const select = (id) => {
    setSelectedId(id);
    setSealed(false);
  };

  return (
    <div className="landing-evm-demo">
      <div className="evm-ballot-casing">
        <div className="evm-casing-header">
          <div className="evm-casing-title">
            <IconEmblem size={14} />
            <span>LIVE PREVIEW · BALLOT UNIT</span>
          </div>
          <div className="evm-ready-indicator">
            <span className="pulse-dot"></span>
            <span>READY</span>
          </div>
        </div>

        <div className="evm-candidate-list">
          {demoCandidates.map((cand) => {
            const isSelected = selectedId === cand.id;
            return (
              <div
                key={cand.id}
                className={`evm-candidate-row landing-demo-row ${isSelected ? 'selected' : ''}`}
                onClick={() => select(cand.id)}
              >
                <div className="landing-demo-label">
                  <div className="evm-cand-name">{cand.label}</div>
                  <div className="evm-party-name">{cand.party}</div>
                </div>
                <div className="evm-symbol-box" style={{ color: '#000' }}>
                  {getPartySymbolIcon(cand, { size: 20 })}
                </div>
                <div className={`evm-led-lamp ${isSelected ? 'glowing' : ''}`} />
                <button
                  type="button"
                  className="evm-blue-btn landing-demo-vote-btn"
                  onClick={(e) => { e.stopPropagation(); select(cand.id); }}
                >
                  {isSelected ? <><IconCheck size={11} /> SELECTED</> : <><IconDot size={8} /> VOTE</>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="landing-demo-seal-row">
          <button
            type="button"
            className="evm-blue-btn"
            style={{ width: '100%' }}
            disabled={!selectedId}
            onClick={() => setSealed(true)}
          >
            <IconDot size={10} /> PRESS BLUE BUTTON TO VOTE
          </button>
        </div>
      </div>

      <div className="vvpat-display-casing">
        <div className="vvpat-casing-badge">
          <span>VVPAT OPTICAL DISPLAY</span>
        </div>
        <div className="vvpat-glass-window landing-demo-glass">
          <div className="vvpat-glass-glare"></div>
          {sealed && selectedCandidate ? (
            <div className="vvpat-paper-slip">
              <div className="slip-header">ILLUSTRATIVE VVPAT SLIP</div>
              <div className="slip-body">
                <div>
                  <div className="slip-cand-name">{selectedCandidate.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#555' }}>{selectedCandidate.party}</div>
                </div>
                <div className="slip-symbol">{getPartySymbolIcon(selectedCandidate, { size: 20 })}</div>
              </div>
              <div className="slip-hash-box">SEALED · demo0a1c7f...92e</div>
            </div>
          ) : (
            <div className="landing-demo-glass-empty">
              Select a candidate and press the blue button.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingView({ onEnter }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="brand-emblem landing-brand-emblem"><IconEmblem size={16} /></div>
            <span className="landing-brand-name">BlockVote<span>.Bharat</span></span>
          </div>
          <div className="landing-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#security">Security</a>
            <button type="button" className="apple-btn apple-btn-primary landing-nav-cta" onClick={onEnter}>
              {CTA_ENTER}
            </button>
          </div>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <h1 className="landing-hero-title">Vote the way you know. Trust a ledger no one owns.</h1>
            <p className="landing-hero-sub">
              The familiar EVM and VVPAT flow, backed by a blockchain ledger every vote can verify but no one can alter.
            </p>
            <div className="landing-hero-ctas">
              <button type="button" className="apple-btn apple-btn-primary" onClick={onEnter}>
                {CTA_ENTER} <IconArrowRight size={15} />
              </button>
              <a href="#how-it-works" className="apple-btn apple-btn-secondary">
                See How It Works
              </a>
            </div>
          </div>
          <div className="landing-hero-visual">
            <HeroBallotDemo />
          </div>
        </div>
      </header>

      <RevealSection className="landing-section" id="security">
        <div className="landing-section-head">
          <h2 className="landing-section-title">Built so no single point can be trusted alone.</h2>
          <p className="landing-section-sub">Five independent safeguards, each one already live in the running system.</p>
        </div>

        <div className="landing-bento">
          <div className="landing-bento-cell landing-bento-wide">
            <div className="landing-bento-icon"><IconMesh size={19} /></div>
            <h3>3-Node Byzantine Mesh</h3>
            <p>Node-Alpha, Node-Beta and Node-Gamma cross-check every block. Two honest nodes always outvote one that lies.</p>
            <div className="landing-bento-canvas"><P2PCanvas /></div>
          </div>
          <div className="landing-bento-cell">
            <div className="landing-bento-icon"><IconLedger size={19} /></div>
            <h3>SHA3-256 Merkle Proofs</h3>
            <p>Every ballot hashes into a Merkle tree, so any citizen can prove their vote is in a block without exposing it.</p>
            <MerkleDiagram />
          </div>
          <div className="landing-bento-cell">
            <div className="landing-bento-icon"><IconIdCard size={19} /></div>
            <h3>Verhoeff Checksum Identity</h3>
            <p>Aadhaar and EPIC numbers are validated with a Verhoeff ($D_5$) checksum before they ever reach the roll.</p>
          </div>
          <div className="landing-bento-cell">
            <div className="landing-bento-icon"><IconLock size={19} /></div>
            <h3>Zero-Knowledge Nullifiers</h3>
            <p>A nullifier proves you have not voted twice without ever linking your identity to your ballot.</p>
          </div>
          <div className="landing-bento-cell">
            <div className="landing-bento-icon"><IconVvpat size={19} /></div>
            <h3>VVPAT Paper-Trail Parity</h3>
            <p>Every digital ballot mirrors the same seven-second paper-slip confirmation voters already trust at the booth.</p>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="landing-section" id="how-it-works">
        <div className="landing-section-head">
          <h2 className="landing-section-title">Three steps, the same as any polling booth.</h2>
        </div>

        <div className="landing-steps">
          <div className="landing-step">
            <div className="journey-step-badge landing-step-badge">1</div>
            <h3>Verify your identity</h3>
            <p>Aadhaar and Voter ID are checked with a Verhoeff checksum, then discarded. Only a twelve-word secret survives.</p>
          </div>
          <div className="journey-arrow landing-step-arrow"><IconArrowRight size={17} /></div>
          <div className="landing-step">
            <div className="journey-step-badge landing-step-badge">2</div>
            <h3>Cast your ballot</h3>
            <p>Pick a candidate on the EVM screen and press the blue button, exactly like a real polling booth.</p>
          </div>
          <div className="journey-arrow landing-step-arrow"><IconArrowRight size={17} /></div>
          <div className="landing-step">
            <div className="journey-step-badge landing-step-badge">3</div>
            <h3>Audit your receipt</h3>
            <p>Paste your VVPAT hash into the public ledger and watch your own Merkle proof resolve.</p>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="landing-section" id="fault-tolerance">
        <div className="landing-section-head">
          <h2 className="landing-section-title">When one node lies, the other two catch it.</h2>
          <p className="landing-section-sub">This is the same Byzantine fault tolerance sandbox running live inside the app today.</p>
        </div>

        <div className="landing-fault-grid">
          <div className="landing-fault-card">
            <div className="landing-fault-head">
              <span>Node-Alpha</span>
              <span className="status-pill" style={{ background: 'rgba(255, 69, 58, 0.2)', color: 'var(--apple-red)', border: '1px solid var(--apple-red)' }}>
                BYZANTINE CORRUPT
              </span>
            </div>
            <p>A tampered ledger reports a hash the other two nodes never signed.</p>
          </div>
          <div className="landing-fault-card">
            <div className="landing-fault-head">
              <span>Node-Beta &amp; Node-Gamma</span>
              <span className="status-pill" style={{ background: 'rgba(48, 209, 88, 0.2)', color: 'var(--apple-green)', border: '1px solid var(--apple-green)' }}>
                SYNCHRONIZED
              </span>
            </div>
            <p>Majority consensus rebuilds Node-Alpha's ledger automatically. No vote is lost.</p>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="landing-closing">
        <h2 className="landing-closing-title">Your vote deserves a receipt.</h2>
        <button type="button" className="apple-btn apple-btn-primary landing-closing-cta" onClick={onEnter}>
          {CTA_ENTER} <IconArrowRight size={16} />
        </button>
      </RevealSection>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span>BlockVote Bharat, an EVM and VVPAT-style voting simulation.</span>
          <div className="landing-footer-specs">
            <span>SHA3-256 Merkle Proofs</span>
            <span>Verhoeff Checksum $D_5$</span>
            <span>3-Node Byzantine Mesh Consensus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
