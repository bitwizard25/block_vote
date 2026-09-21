import React from 'react';

/* ==========================================================================
   BLOCKVOTE BHARAT — LINE ICON SYSTEM
   Monoline, geometric, currentColor. Drawn for the EVM/VVPAT "machined
   hardware" visual language so every glyph renders identically everywhere,
   and active/interactive states can tint the icon like real UI chrome
   instead of a fixed-color emoji.
   ========================================================================== */

const base = (size, props) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
  ...props,
});

/* --- Brand mark: chip silhouette + 8-spoke wheel (tech + civic, original artwork) --- */
export function IconEmblem({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 2 20 6.5V17.5L12 22 4 17.5V6.5Z" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M15.6 12H17.3M14.55 14.55l1.2 1.2M12 15.6V17.3M9.45 14.55l-1.2 1.2M8.4 12H6.7M9.45 9.45l-1.2-1.2M12 8.4V6.7M14.55 9.45l1.2-1.2" />
    </svg>
  );
}

/* --- Navigation --- */
export function IconBallotBox({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M3.5 9.5h17L19 20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20L3.5 9.5Z" />
      <path d="M3.5 9.5 6 4h12l2.5 5.5" />
      <path d="M9 12.5 11 14.5 15 10" />
    </svg>
  );
}

export function IconIdCard({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <circle cx="8" cy="11" r="2" />
      <path d="M5.3 16c.4-1.6 1.6-2.4 2.7-2.4s2.3.8 2.7 2.4" />
      <path d="M13.5 9.5h5M13.5 12.5h5M13.5 15.5h3.5" />
    </svg>
  );
}

export function IconVvpat({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 3h9l3 3v6" />
      <path d="M6 3v18h6.5" />
      <path d="M9 8h6M9 11.5h6M9 15h3" />
      <circle cx="16.3" cy="16.3" r="3" />
      <path d="M18.5 18.5 21 21" />
    </svg>
  );
}

export function IconPulse({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M3 12h3.3l2-5.2L11.5 17l2.3-7 1.4 2.2H21" />
    </svg>
  );
}

export function IconLedger({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <rect x="3.5" y="4" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="4" width="7" height="7" rx="1.3" />
      <rect x="8.5" y="13.5" width="7" height="7" rx="1.3" />
      <path d="M10.5 7.5h3M7 11v2.5M17 11v2.5" />
    </svg>
  );
}

export function IconShieldCheck({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 3 19 6v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12.2 11.2 14.4 15.5 10" />
    </svg>
  );
}

/* --- Chrome / controls --- */
export function IconMenu({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconChevronDown({ size = 16, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconChevronUp({ size = 16, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

export function IconArrowRight({ size = 16, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M4 12h15.5M14 6.5 19.5 12 14 17.5" />
    </svg>
  );
}

/* --- Status / feedback --- */
export function IconWarningTriangle({ size = 18, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 3.5 21 19.5H3L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.6" r="0.95" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClockPending({ size = 18, ...props }) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function IconInfoCircle({ size = 16, ...props }) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8.2" r="0.95" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheck({ size = 14, ...props }) {
  return (
    <svg {...base(size, { strokeWidth: 2.2, ...props })}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function IconDot({ size = 10, ...props }) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="12" r="7.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* --- Identity / OTP --- */
export function IconPhoneOtp({ size = 32, ...props }) {
  return (
    <svg {...base(size, props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M10.3 5.5h3.4" />
      <circle cx="9.3" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M9.5 18h5" />
    </svg>
  );
}

export function IconUser({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="8.3" r="3.3" />
      <path d="M5 19c1-3.2 3.8-5 7-5s6 1.8 7 5" />
    </svg>
  );
}

export function IconLock({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMesh({ size = 20, ...props }) {
  return (
    <svg {...base(size, props)}>
      <circle cx="6" cy="7" r="2.1" />
      <circle cx="18" cy="7" r="2.1" />
      <circle cx="12" cy="18" r="2.1" />
      <path d="M7.7 8.3 10.6 16.2M16.3 8.3 13.4 16.2M8 7h8" />
    </svg>
  );
}

export function IconReceiptLarge({ size = 40, ...props }) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 2.5h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3v-18Z" />
      <path d="M8.5 7h7M8.5 10.3h7M8.5 13.6h4.5" />
    </svg>
  );
}
