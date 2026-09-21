import React from 'react';

/* ==========================================================================
   ELECTION SYMBOL ARTWORK
   Real Indian EVMs and ballots print party symbols as simple bold black
   pictograms on a white sticker — not full-colour icons. These match that
   printed-stencil register (solid strokes, no fill, sized for a white tile)
   instead of borrowing the candidate's literal emoji.
   ========================================================================== */

const base = (size, props) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
  ...props,
});

export function SymbolScale({ size = 26, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 3v15" />
      <path d="M6 6h12" />
      <path d="M6 6 3.6 11.3a2.6 2.6 0 0 0 4.8 0L6 6Z" />
      <path d="M18 6l-2.4 5.3a2.6 2.6 0 0 0 4.8 0L18 6Z" />
      <path d="M8.5 21h7" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function SymbolWheat({ size = 26, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 21V6" />
      <path d="M12 8 8.5 5M12 8l3.5-3M12 11 8 8.5M12 11l4-2.5M12 14 7.7 12M12 14l4.3-2" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function SymbolBulb({ size = 26, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 3.5a5.5 5.5 0 0 1 3.2 10c-.6.45-1 1.1-1 1.9v.6h-4.4v-.6c0-.8-.4-1.45-1-1.9A5.5 5.5 0 0 1 12 3.5Z" />
      <path d="M10 18.7h4" />
      <path d="M10.6 20.7h2.8" />
    </svg>
  );
}

/**
 * Resolves a candidate to their official election-symbol artwork.
 * Falls back on name/party heuristics for demo data that predates
 * a `symbol_key` field on the candidate record.
 */
export function getPartySymbolIcon(candidate, props = {}) {
  const key = candidate?.symbol_key
    || (candidate?.party?.includes('Pragati') || candidate?.name?.includes('Rajeshwar') ? 'scale'
      : candidate?.party?.includes('Seva') || candidate?.name?.includes('Sunita') ? 'wheat'
        : 'bulb');

  if (key === 'scale') return <SymbolScale {...props} />;
  if (key === 'wheat') return <SymbolWheat {...props} />;
  return <SymbolBulb {...props} />;
}
