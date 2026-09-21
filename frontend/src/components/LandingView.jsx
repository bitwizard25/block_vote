import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { apiUrl } from '../apiConfig';
import P2PCanvas from './P2PCanvas';
import { getPartySymbolIcon } from './partySymbols';
import {
  IconEmblem, IconArrowRight, IconCheck, IconDot, IconMenu, IconClose,
  IconLedger, IconIdCard, IconMesh, IconLock, IconVvpat
} from './icons';

gsap.registerPlugin(ScrollTrigger);

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

/* Five pending ballots flowing into one sealed, hashed block - the actual
   mempool -> PoW miner path (batches of 5, SHA3-256 sealed, no operator
   in the loop). Mirrors the Merkle diagram's stroke tokens, not new ones. */
function MempoolDiagram() {
  return (
    <svg viewBox="0 0 180 90" width="100%" height="72" fill="none" aria-hidden="true">
      <g stroke="rgba(255,255,255,0.3)" strokeWidth="1.4">
        <rect x="8" y="16" width="15" height="15" rx="2.5" />
        <rect x="8" y="37" width="15" height="15" rx="2.5" />
        <rect x="8" y="58" width="15" height="15" rx="2.5" />
        <rect x="30" y="26" width="15" height="15" rx="2.5" />
        <rect x="30" y="48" width="15" height="15" rx="2.5" />
      </g>
      <path d="M52 45 L96 45" stroke="var(--apple-blue)" strokeWidth="1.6" strokeDasharray="3 4" />
      <path d="M90 39 L96 45 L90 51" stroke="var(--apple-blue)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="108" y="21" width="44" height="44" rx="7" fill="rgba(48,209,88,0.15)" stroke="var(--apple-green)" strokeWidth="1.6" />
      <path d="M120 44 L129 53 L142 36" stroke="var(--apple-green)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* A real, working, simplified EVM + VVPAT preview built from the exact same
   CSS the live app uses (see index.css .evm-* / .vvpat-*), not a fake
   div-screenshot. The candidate rows are local demo state (generic
   candidates, so this reads as "how the product works," not a specific
   pretend election) - but the "READY" status and ledger readout below it
   are fetched from the real, public, no-auth /api/blocks and /api/mempool
   endpoints, so the one thing on the page that calls itself live actually
   is, or honestly says it isn't. */
function HeroBallotDemo() {
  const demoCandidates = [
    { id: 'a', label: 'Candidate A', party: 'Demo Party', symbol_key: 'scale' },
    { id: 'b', label: 'Candidate B', party: 'Demo Party', symbol_key: 'wheat' },
    { id: 'c', label: 'Candidate C', party: 'Demo Party', symbol_key: 'bulb' },
  ];
  const [selectedId, setSelectedId] = useState(null);
  const [sealed, setSealed] = useState(false);
  const [liveStats, setLiveStats] = useState(null); // null = loading, 'error' = unreachable, else {blocks, pending}

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiUrl('/api/blocks')).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(apiUrl('/api/mempool')).then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([blocks, mempool]) => {
        if (!cancelled) setLiveStats({ blocks: blocks.length, pending: mempool.length });
      })
      .catch(() => {
        if (!cancelled) setLiveStats('error');
      });
    return () => { cancelled = true; };
  }, []);

  const isLive = liveStats && liveStats !== 'error';
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
          <div className="evm-ready-indicator" style={!isLive ? { color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', borderColor: 'var(--material-border)' } : undefined}>
            <span className={`pulse-dot ${isLive ? '' : 'dim'}`}></span>
            <span>{liveStats === 'error' ? 'OFFLINE' : isLive ? 'READY' : 'CONNECTING'}</span>
          </div>
        </div>

        {isLive && (
          <div className="landing-hero-live-readout" style={{ padding: '10px 18px 0' }}>
            Ledger height: <strong>{liveStats.blocks}</strong> block{liveStats.blocks === 1 ? '' : 's'} · <strong>{liveStats.pending}</strong> vote{liveStats.pending === 1 ? '' : 's'} pending
          </div>
        )}

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
  const [navOpen, setNavOpen] = useState(false);
  const rootRef = useRef(null);

  // Scroll-driven depth. Every trigger here is one specific, motivated
  // moment (see comments) - not parallax spread across the whole page.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // A: the hero's ambient glow is the one element in the whole app that
      // already calls itself "depth" (see body::before) but never moved.
      // Give it real parallax drift instead of decorating a claim with
      // nothing behind it.
      if (document.querySelector('.landing-hero-glow')) {
        gsap.to('.landing-hero-glow', {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: { trigger: '.landing-hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      }

      // B: the live mesh canvas counter-drifts a few px against its own
      // card, reading as "a window onto a running process" rather than
      // art printed into the card.
      if (document.querySelector('.landing-bento-wide .landing-bento-canvas')) {
        gsap.to('.landing-bento-wide .landing-bento-canvas', {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: '.landing-bento-wide', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        });
      }

      // C: this section's content is the only genuinely time-ordered
      // narrative on the page (corrupt -> healed). Scrubbing it lets the
      // reader pace that transition themselves instead of it just fading in.
      if (document.querySelector('.landing-fault-grid')) {
        gsap.timeline({
          scrollTrigger: { trigger: '.landing-fault-grid', start: 'top center', end: '+=60%', scrub: 1 },
        })
          .to('.landing-fault-beam', { scaleX: 1, duration: 1, ease: 'none' })
          .to('.landing-fault-pill-corrupt', { opacity: 0, duration: 0.3 }, 0.45)
          .to('.landing-fault-pill-restored', { opacity: 1, duration: 0.3 }, 0.45);
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-page" ref={rootRef}>
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="brand-emblem landing-brand-emblem"><IconEmblem size={16} /></div>
            <span className="landing-brand-name">BlockVote<span>.Bharat</span></span>
            <span className="landing-brand-hindi">देश का डिजिटल वोटिंग मंच</span>
          </div>
          <div className="landing-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#security">Security</a>
            <a href="#audit">Audit a vote</a>
            <button type="button" className="apple-btn apple-btn-primary landing-nav-cta" onClick={onEnter}>
              Login
            </button>
          </div>
          <button
            type="button"
            className="landing-nav-toggle"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={navOpen}
          >
            {navOpen ? <IconClose size={17} /> : <IconMenu size={17} />}
          </button>
        </div>
        {navOpen && (
          <div className="landing-nav-mobile-panel">
            <a href="#how-it-works" onClick={() => setNavOpen(false)}>How it works</a>
            <a href="#security" onClick={() => setNavOpen(false)}>Security</a>
            <a href="#audit" onClick={() => setNavOpen(false)}>Audit a vote</a>
            <button type="button" className="apple-btn apple-btn-primary" style={{ marginTop: '8px' }} onClick={() => { setNavOpen(false); onEnter(); }}>
              Login
            </button>
          </div>
        )}
      </nav>

      <section className="landing-hero" aria-labelledby="hero-heading">
        <div className="landing-hero-glow" aria-hidden="true"></div>
        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <h1 id="hero-heading" className="landing-hero-title">Vote the way you know. Trust a ledger no one owns.</h1>
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
            <div className="landing-hero-proof-strip">
              <span className="status-pill">SHA3-256 sealed</span>
              <span className="status-pill">3-node replicated</span>
              <span className="status-pill">Publicly auditable</span>
              <span className="status-pill">Aadhaar-verified roll</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <HeroBallotDemo />
          </div>
        </div>
      </section>

      <RevealSection className="landing-section" id="security">
        <div className="landing-section-head">
          <h2 className="landing-section-title">Built so no single point can be trusted alone.</h2>
          <p className="landing-section-sub">Six independent safeguards, each one already live in the running system.</p>
        </div>

        <div className="landing-bento">
          <div className="landing-bento-cell landing-bento-wide">
            <div className="landing-bento-icon"><IconMesh size={19} /></div>
            <h3>3-Node Byzantine Mesh</h3>
            <p>Node-Alpha, Node-Beta and Node-Gamma each hold a full, independent copy of the ledger. The moment one reports a block the others never signed, a peer's untouched ledger overwrites it automatically.</p>
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
            <h3>Verified Electoral Identity</h3>
            <p>Aadhaar numbers are checked with a Verhoeff ($D_5$) checksum, the same self-correcting algorithm UIDAI specifies, before they ever reach the roll. Voter ID (EPIC) numbers are format-verified against the Election Commission's issuing pattern.</p>
          </div>
          <div className="landing-bento-cell">
            <div className="landing-bento-icon"><IconLock size={19} /></div>
            <h3>Unlinkable Vote Nullifiers</h3>
            <p>Your secret and the election ID hash into a nullifier that proves you haven't voted twice, without that hash ever revealing your identity or your choice.</p>
          </div>
          <div className="landing-bento-cell">
            <div className="landing-bento-icon"><IconVvpat size={19} /></div>
            <h3>VVPAT Paper-Trail Parity</h3>
            <p>Every digital ballot mirrors the same seven-second paper-slip confirmation voters already trust at the booth.</p>
          </div>
          <div className="landing-bento-cell landing-bento-full">
            <div className="landing-bento-full-content">
              <div>
                <div className="landing-bento-icon"><IconDot size={16} /></div>
                <h3>Auto-Sealing Mempool</h3>
                <p>Every vote lands in a pending pool first. Once five ballots queue up, they seal into a new block automatically, Proof-of-Work hashed with SHA3-256, with no operator in the loop.</p>
              </div>
              <div className="landing-bento-full-diagram"><MempoolDiagram /></div>
            </div>
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
            <p>Aadhaar and Voter ID are verified, then discarded. Only a twelve-word secret survives.</p>
          </div>
          <div className="journey-arrow landing-step-arrow"><IconArrowRight size={17} /></div>
          <div className="landing-step">
            <div className="journey-step-badge landing-step-badge">2</div>
            <h3>Cast your ballot</h3>
            <p>Pick a candidate on the EVM screen and press the blue button, exactly like a real polling booth.</p>
          </div>
          <div className="journey-arrow landing-step-arrow"><IconArrowRight size={17} /></div>
          <div className="landing-step" id="audit">
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
          <div className="landing-fault-beam" aria-hidden="true"></div>
          <div className="landing-fault-card">
            <div className="landing-fault-head">
              <span>Node-Alpha</span>
              <span className="landing-fault-pill-stack">
                <span className="status-pill landing-fault-pill-corrupt" style={{ background: 'rgba(255, 69, 58, 0.2)', color: 'var(--apple-red)', border: '1px solid var(--apple-red)' }}>
                  BYZANTINE CORRUPT
                </span>
                <span className="status-pill landing-fault-pill-restored" style={{ background: 'rgba(48, 209, 88, 0.2)', color: 'var(--apple-green)', border: '1px solid var(--apple-green)', opacity: 0 }}>
                  RESTORED
                </span>
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
            <p>A healthy peer's ledger restores Node-Alpha automatically. No vote is lost.</p>
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
        <div className="landing-footer-grid">
          <div className="landing-footer-col">
            <div className="landing-footer-brand">
              <div className="brand-emblem" style={{ width: 28, height: 28 }}><IconEmblem size={14} /></div>
              <span className="landing-footer-brand-name">BlockVote<span>.Bharat</span></span>
            </div>
            <p>
              An EVM and VVPAT-style blockchain voting simulation, built for civic-tech education.
              Not affiliated with the Election Commission of India.
            </p>
          </div>
          <div className="landing-footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#audit">Audit a vote</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onEnter(); }}>Login</a></li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h4>Technical specs</h4>
            <ul>
              <li>SHA3-256 Merkle Proofs</li>
              <li>Verhoeff Checksum $D_5$</li>
              <li>3-Node Byzantine Mesh</li>
              <li>Proof-of-Work Block Sealing</li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h4>About</h4>
            <p>Open-source civic-tech demo. Built with Go and React.</p>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 BlockVote Bharat. A demonstration project, not a government service.</span>
        </div>
      </footer>
    </div>
  );
}
