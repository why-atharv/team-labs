import React from 'react';

export function LegendaryBanner({ animal, pokemon }) {
  const target = animal || pokemon;
  if (!target) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'bannerSlideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.96))',
          border: '2px solid #f59e0b',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.7), inset 0 0 20px rgba(245, 158, 11, 0.3)',
          borderRadius: '18px',
          padding: '16px 36px',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: '#f59e0b',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}
        >
          👑 APEX BEAST EMERGENCE • SANCTUARY TELEMETRY ALERT 👑
        </div>

        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '32px',
            fontWeight: '900',
            color: '#ffffff',
            letterSpacing: '0.12em',
            textShadow: '0 0 24px #f59e0b, 0 0 45px rgba(245, 158, 11, 0.6)'
          }}
        >
          {target.name.toUpperCase()} HAS ENTERED THE SANCTUARY
        </div>

        {target.scientificName && (
          <div
            style={{
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#cbd5e1',
              letterSpacing: '0.08em'
            }}
          >
            {target.scientificName}
          </div>
        )}

        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: '#e2e8f0',
            letterSpacing: '0.04em',
            marginTop: '2px'
          }}
        >
          An apex sovereign prowls into the living sanctuary. Scan the holographic beacon to document!
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const ApexBanner = LegendaryBanner;
