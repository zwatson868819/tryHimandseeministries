import React from 'react';

// Decorative stained-glass overlay: a softly glowing pane of colored "glass"
// inspired by cathedral windows. Pure SVG, scales fluidly, ~3 KB.
// Drop behind any hero with absolute/relative positioning + low opacity.
const StainedGlassOverlay = ({ className = '', style = {} }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 400 600"
    preserveAspectRatio="xMidYMid slice"
    className={`absolute pointer-events-none mix-blend-screen opacity-25 ${className}`}
    style={style}
  >
    <defs>
      <radialGradient id="sg-amber" cx="50%" cy="20%" r="60%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sg-rose" cx="20%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#fb7185" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#3a1d04" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sg-sky" cx="80%" cy="65%" r="55%">
        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sg-emerald" cx="50%" cy="90%" r="45%">
        <stop offset="0%" stopColor="#86efac" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
      </radialGradient>
      <pattern id="sg-leading" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0,0 L 40,0 L 40,40 L 0,40 Z" fill="none" stroke="rgba(40,20,5,0.35)" strokeWidth="0.8" />
        <path d="M 20,0 L 20,40 M 0,20 L 40,20" stroke="rgba(40,20,5,0.2)" strokeWidth="0.5" />
      </pattern>
    </defs>

    {/* The "window" shape — gothic arch */}
    <path
      d="M 50,580 L 50,180 Q 50,30 200,30 Q 350,30 350,180 L 350,580 Z"
      fill="url(#sg-amber)"
    />
    <path
      d="M 50,580 L 50,180 Q 50,30 200,30 Q 350,30 350,180 L 350,580 Z"
      fill="url(#sg-rose)"
    />
    <path
      d="M 50,580 L 50,180 Q 50,30 200,30 Q 350,30 350,180 L 350,580 Z"
      fill="url(#sg-sky)"
    />
    <path
      d="M 50,580 L 50,180 Q 50,30 200,30 Q 350,30 350,180 L 350,580 Z"
      fill="url(#sg-emerald)"
    />

    {/* Leading (the dark lines between glass pieces) */}
    <path
      d="M 50,580 L 50,180 Q 50,30 200,30 Q 350,30 350,180 L 350,580 Z"
      fill="url(#sg-leading)"
      opacity="0.45"
    />

    {/* Central rosette */}
    <g stroke="rgba(40,20,5,0.4)" strokeWidth="1.2" fill="none">
      <circle cx="200" cy="220" r="60" />
      <circle cx="200" cy="220" r="35" />
      <path d="M 200,160 L 200,280 M 140,220 L 260,220" />
      <path d="M 158,178 L 242,262 M 158,262 L 242,178" />
    </g>
    <circle cx="200" cy="220" r="12" fill="#fbbf24" opacity="0.6" />
  </svg>
);

export default StainedGlassOverlay;
