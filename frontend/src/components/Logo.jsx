import React from 'react';

export default function Logo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--primary)" />
          <stop offset="55%"  stopColor="var(--gold)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <linearGradient id="logo-grad-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer ring arc */}
      <circle
        cx="50" cy="50" r="38"
        stroke="url(#logo-grad-a)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="180 60"
        strokeDashoffset="-20"
        opacity="0.35"
      />

      {/* Main infinity-like path */}
      <path
        d="M22,50 C22,32 38,32 50,50 C62,68 78,68 78,50 C78,32 62,32 50,50 C38,68 22,68 22,50 Z"
        stroke="url(#logo-grad-a)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logo-glow)"
      />

      {/* Left node */}
      <circle cx="22" cy="50" r="5.5" fill="var(--primary)" />
      <circle cx="22" cy="50" r="2.5" fill="white" opacity="0.7" />

      {/* Right node */}
      <circle cx="78" cy="50" r="5.5" fill="var(--accent)" />
      <circle cx="78" cy="50" r="2.5" fill="white" opacity="0.7" />

      {/* Center dot */}
      <circle cx="50" cy="50" r="3.5" fill="var(--gold)" />
    </svg>
  );
}