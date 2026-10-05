import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import QRCode from 'qrcode';

export function DynamicQRCode({
  animalId,
  pokemonId,
  name,
  scientificName,
  conservationStatus,
  category,
  rarity,
  color = '#38bdf8',
  heightOffset = 2.6,
  isCapturing = false
}) {
  const targetId = animalId || pokemonId;
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (!targetId) return;

    // Generate high-contrast, fast-scanning QR code data URL
    QRCode.toDataURL(targetId, {
      width: 160,
      margin: 1,
      color: {
        dark: '#030712', // Deep near-black for maximum contrast
        light: '#ffffff'  // Pure crisp white
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('QR generation error:', err));

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  if (!qrDataUrl || isCapturing) {
    // Hide QR code during capture dissolve sequence
    return null;
  }

  const isApex = rarity === 'legendary';
  const isRare = rarity === 'rare';

  const badgeBorderColor = isApex ? '#f59e0b' : isRare ? '#10b981' : '#38bdf8';
  const badgeGlow = isApex
    ? '0 0 16px rgba(245, 158, 11, 0.75)'
    : isRare
    ? '0 0 12px rgba(16, 185, 129, 0.65)'
    : '0 0 8px rgba(56, 189, 248, 0.5)';

  // Status color coding
  let statusColor = '#38bdf8';
  if (conservationStatus === 'Critically Endangered' || conservationStatus === 'Endangered') {
    statusColor = '#ef4444';
  } else if (conservationStatus === 'Vulnerable' || conservationStatus === 'Near Threatened') {
    statusColor = '#f59e0b';
  } else if (conservationStatus === 'Least Concern') {
    statusColor = '#10b981';
  }

  return (
    <Html
      center
      position={[0, heightOffset, 0]}
      distanceFactor={14}
      style={{
        pointerEvents: 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isCapturing ? 0 : 1,
        transform: isCapturing ? 'scale(0.5)' : 'scale(1)'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
          filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.85))'
        }}
      >
        {/* Holographic Wildlife Telemetry Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '5px',
            padding: '4px 10px',
            background: 'rgba(2, 6, 23, 0.9)',
            border: `1px solid ${badgeBorderColor}`,
            boxShadow: badgeGlow,
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isApex && (
              <span style={{ fontSize: '11px', color: '#f59e0b' }}>
                👑
              </span>
            )}
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}
            >
              {name ? name.toUpperCase() : 'WILD SPECIMEN'}
            </span>
            {isApex && (
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  letterSpacing: '0.05em'
                }}
              >
                APEX
              </span>
            )}
          </div>

          {scientificName && (
            <div
              style={{
                fontSize: '9px',
                fontStyle: 'italic',
                color: '#94a3b8',
                letterSpacing: '0.02em',
                marginTop: '1px'
              }}
            >
              {scientificName}
            </div>
          )}

          {conservationStatus && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
                fontSize: '8px',
                fontWeight: '700',
                color: statusColor,
                fontFamily: "'Space Mono', monospace"
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusColor }} />
              <span>{conservationStatus.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Dynamic High-Contrast QR Frame */}
        <div
          style={{
            position: 'relative',
            padding: '5px',
            background: '#ffffff',
            borderRadius: '10px',
            border: `2px solid ${badgeBorderColor}`,
            boxShadow: `${badgeGlow}, 0 8px 24px rgba(0,0,0,0.7)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Telemetry corner brackets */}
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              width: '8px',
              height: '8px',
              borderTop: `2px solid ${badgeBorderColor}`,
              borderLeft: `2px solid ${badgeBorderColor}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '8px',
              height: '8px',
              borderTop: `2px solid ${badgeBorderColor}`,
              borderRight: `2px solid ${badgeBorderColor}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '-4px',
              width: '8px',
              height: '8px',
              borderBottom: `2px solid ${badgeBorderColor}`,
              borderLeft: `2px solid ${badgeBorderColor}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '8px',
              height: '8px',
              borderBottom: `2px solid ${badgeBorderColor}`,
              borderRight: `2px solid ${badgeBorderColor}`
            }}
          />

          <img
            src={qrDataUrl}
            alt="Scan Wildlife QR"
            style={{
              width: '74px',
              height: '74px',
              display: 'block',
              imageRendering: 'pixelated'
            }}
          />
        </div>

        {/* Scanner Anchor Beacon */}
        <div
          style={{
            width: '2px',
            height: '14px',
            background: `linear-gradient(180deg, ${badgeBorderColor}, transparent)`,
            opacity: 0.8
          }}
        />
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: badgeBorderColor,
            boxShadow: badgeGlow
          }}
        />
      </div>
    </Html>
  );
}
