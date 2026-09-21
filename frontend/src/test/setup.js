import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// NumberFlow renders a real Web Component (<number-flow>) whose lifecycle
// (getSnapshotBeforeUpdate -> this.el.willUpdate) relies on custom-element
// upgrade behaviour jsdom doesn't fully implement, so it crashes on the
// second render in tests (works fine in real browsers, verified manually).
// Stub it with a plain span that renders the same `value` so components and
// tests keep working; only the digit-roll animation itself is skipped.
vi.mock('@number-flow/react', () => ({
  default: ({ value }) => React.createElement('span', null, String(value)),
}));

// jsdom doesn't implement matchMedia. Components use it to check
// prefers-reduced-motion (GSAP sequences, etc.), so stub a "no preference"
// response for tests rather than special-casing every call site.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom doesn't implement IntersectionObserver either (used for scroll-reveal
// on the landing page). Stub a no-op version. Content stays in the DOM
// either way (queries still find it); only the opacity/transform reveal
// transition is skipped in tests.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
