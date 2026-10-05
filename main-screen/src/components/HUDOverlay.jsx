import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, VolumeX, Maximize, Sparkles, Wifi, RefreshCw } from 'lucide-react';
import { installationAudio } from '../utils/audio.js';
import QRCode from 'qrcode';

export function HUDOverlay({
  isConnected,
  animalCount,
  pokemonCount,
  recentCapture,
  serverInfo,
  onSpawnApex,
  onSpawnLegendary
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [mobileQrUrl, setMobileQrUrl] = useState('');
  const [selectedIpIndex, setSelectedIpIndex] = useState(0);

  const count = animalCount !== undefined ? animalCount : (pokemonCount || 0);
  const handleSpawn = onSpawnApex || onSpawnLegendary;

  // Available LAN IPs detected by the backend
  const availableIps = useMemo(() => {
    if (serverInfo?.allIps?.length) {
      return serverInfo.allIps.map((i) => i.ip);
    }
    if (serverInfo?.lanIp && serverInfo.lanIp !== 'localhost') {
      return [serverInfo.lanIp];
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return [window.location.hostname];
    }
    return ['localhost'];
  }, [serverInfo]);

  const activeIp = availableIps[selectedIpIndex] || availableIps[0] || 'localhost';
  const isWebDeployment = window.location.hostname.includes('vercel.app') || (window.location.port === '' && window.location.hostname !== 'localhost');
  const mobileWebUrl = isWebDeployment
    ? `${window.location.origin}/scanner/`
    : `http://${activeIp}:5174`;

  useEffect(() => {
    // Generate QR code for mobile phones to connect
    QRCode.toDataURL(mobileWebUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then(setMobileQrUrl)
      .catch(console.error);
  }, [mobileWebUrl]);

  const toggleAudio = () => {
    const muted = installationAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      installationAudio.startAmbientForest();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const cycleIp = () => {
    if (availableIps.length > 1) {
      setSelectedIpIndex((prev) => (prev + 1) % availableIps.length);
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 40
        }}
      >
        {/* Title & Connection Info */}
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '22px',
                fontWeight: '700',
                color: '#f8fafc',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                margin: 0,
                textShadow: '0 0 20px rgba(16, 185, 129, 0.7)'
              }}
            >
              teamLab • Wildlife Living Sanctuary
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: '#94a3b8'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#10b981' : '#ef4444',
                  boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
                }}
              />
              <span>{isConnected ? 'SANCTUARY TELEMETRY ONLINE' : 'CONNECTING TO SANCTUARY...'}</span>
              <span>•</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>{count} ACTIVE WILD SPECIES</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Summon Apex Beast Button */}
          <button
            onClick={handleSpawn}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              color: '#f59e0b',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.35)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={14} />
            <span>Summon Apex Beast</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            style={{
              padding: '8px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#e2e8f0',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '8px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#e2e8f0',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            title="Toggle Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </header>

      {/* Bottom-Right "Connect Phone / Join as Field Ranger" Card */}
      <aside
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          background: 'rgba(2, 6, 23, 0.94)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '16px',
          padding: '14px 18px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {mobileQrUrl && (
          <div style={{ background: '#ffffff', padding: '4px', borderRadius: '8px' }}>
            <img
              src={mobileQrUrl}
              alt="Mobile Scanner URL"
              style={{
                width: '74px',
                height: '74px',
                display: 'block'
              }}
            />
          </div>
        )}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: '#10b981',
              fontWeight: '800',
              letterSpacing: '0.06em'
            }}
          >
            <Wifi size={13} />
            <span>JOIN AS FIELD RANGER</span>
          </div>

          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '3px' }}>
            Scan with phone on local Wi-Fi:
          </div>

          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              fontWeight: '700',
              color: '#f8fafc',
              marginTop: '4px',
              background: 'rgba(0,0,0,0.5)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            {mobileWebUrl}
          </div>

          <a
            href={mobileWebUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px',
              fontSize: '11px',
              color: '#10b981',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            <span>Launch Field Scanner ↗</span>
          </a>

          {availableIps.length > 1 && (
            <button
              onClick={cycleIp}
              style={{
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '10px',
                cursor: 'pointer',
                padding: '2px 0'
              }}
            >
              <RefreshCw size={10} />
              <span>Switch Network Adapter ({selectedIpIndex + 1}/{availableIps.length})</span>
            </button>
          )}
        </div>
      </aside>

      {/* Capture Announcement Toast */}
      {recentCapture && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 45,
            pointerEvents: 'none',
            animation: 'fadeInUp 0.4s ease-out'
          }}
        >
          <div
            style={{
              background: 'rgba(2, 6, 23, 0.95)',
              border: `2px solid ${recentCapture.animal?.color || recentCapture.pokemon?.color || '#10b981'}`,
              boxShadow: `0 0 25px ${recentCapture.animal?.color || recentCapture.pokemon?.color || 'rgba(16, 185, 129, 0.6)'}`,
              borderRadius: '30px',
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(14px)'
            }}
          >
            <span style={{ fontSize: '20px' }}>🌿</span>
            <div>
              <span style={{ fontWeight: '700', color: '#f8fafc' }}>
                {recentCapture.rangerName || recentCapture.trainerName}
              </span>{' '}
              <span style={{ color: '#cbd5e1' }}>documented</span>{' '}
              <span
                style={{
                  fontWeight: '800',
                  color: recentCapture.animal?.color || recentCapture.pokemon?.color || '#10b981',
                  textTransform: 'uppercase'
                }}
              >
                {recentCapture.animal?.name || recentCapture.pokemon?.name}!
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
