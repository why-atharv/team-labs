import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Zap, RefreshCw, Upload, Keyboard, Target, AlertTriangle } from 'lucide-react';

export function ScannerView({ onScan, isPaused, activeAnimals = [], activePokemon = [] }) {
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // Default to rear camera
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isDecodingFile, setIsDecodingFile] = useState(false);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';
  // Guards against double-firing onScan while the previous scan cycle is still completing
  const scanLockRef = useRef(false);

  const targets = activeAnimals.length > 0 ? activeAnimals : activePokemon;

  // Check if browser supports live camera streams in this context
  const supportsLiveCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  // Latest onScan without restarting the camera when its identity changes.
  // (sendScan is recreated on every animal spawn/despawn — restarting the camera each time caused stutter.)
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let instance = null;
    let cancelled = false;

    async function safeStop(scanner) {
      if (!scanner) return;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (e) {
        console.warn('Scanner stop error:', e);
      }
      // clear() is best-effort: right after stop() html5-qrcode may throw a harmless
      // removeChild NotFoundError because React/stop already removed the node.
      try {
        scanner.clear();
      } catch (e) {
        /* element already cleaned up — nothing to do */
      }
    }

    async function startScanner() {
      if (isPaused) return;

      if (!supportsLiveCamera) {
        setCameraError(
          'Live camera requires HTTPS on mobile browsers. Use "Snap QR Photo" or "Tap to Document" below!'
        );
        return;
      }

      try {
        setCameraError(null);
        scanLockRef.current = false;
        instance = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
        html5QrCodeRef.current = instance;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await instance.start(
          { facingMode },
          config,
          (decodedText) => {
            if (cancelled || scanLockRef.current) return;
            scanLockRef.current = true;
            console.log('📷 [QR Decoded via Camera]', decodedText);
            stopScanner().then(() => {
              onScanRef.current(decodedText);
            });
          },
          () => {}
        );

        if (cancelled) {
          // Effect was cleaned up while the camera was still starting — shut it down now
          safeStop(instance);
          return;
        }

        setIsScanning(true);
        try {
          const capabilities = instance.getRunningTrackCapabilities();
          setHasTorch(!!capabilities?.torch);
        } catch (e) {}
      } catch (err) {
        console.warn('Camera start issue:', err);
        if (!cancelled) {
          setCameraError(
            'Live camera access was blocked. Use "Snap QR Photo" or "Tap to Document" below to catalog!'
          );
          setIsScanning(false);
        }
      }
    }

    async function stopScanner() {
      await safeStop(html5QrCodeRef.current);
      if (!cancelled) setIsScanning(false);
    }

    if (!isPaused && supportsLiveCamera) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      cancelled = true;
      // Always stop the closure instance — even if start() has not resolved yet
      // (prevents orphaned camera streams and StrictMode double-mount conflicts)
      safeStop(instance);
      html5QrCodeRef.current = null;
      setIsScanning(false);
    };
  }, [isPaused, facingMode, supportsLiveCamera]);

  // Handle Photo Snapshot (Works 100% on HTTP on every phone without WebRTC permissions)
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingFile(true);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
      }
      // showImage=false keeps the live video element intact in the container
      const decodedText = await html5QrCodeRef.current.scanFile(file, false);
      console.log('📷 [QR Decoded from Snapshot]', decodedText);
      onScan(decodedText);
    } catch (err) {
      alert('Could not detect a QR code in the snapshot. Try aiming closer at the sanctuary screen or tap the animal chip below!');
    } finally {
      setIsDecodingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (html5QrCodeRef.current && hasTorch) {
      try {
        const nextState = !torchOn;
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (e) {
        console.error('Failed to toggle torch:', e);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      setShowManualInput(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        overflow: 'hidden'
      }}
    >
      {/* HTML5 Video Stream Container */}
      <div
        id={scannerContainerId}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {/* Hidden File Input for Native Camera Snapshot */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        style={{ display: 'none' }}
      />

      {/* Biometric Viewfinder Reticle */}
      {!cameraError && (
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '240px',
            height: '240px',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          {/* Corner Brackets */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '28px',
              height: '28px',
              borderTop: '3px solid #10b981',
              borderLeft: '3px solid #10b981',
              borderTopLeftRadius: '8px'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '28px',
              height: '28px',
              borderTop: '3px solid #10b981',
              borderRight: '3px solid #10b981',
              borderTopRightRadius: '8px'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '28px',
              height: '28px',
              borderBottom: '3px solid #10b981',
              borderLeft: '3px solid #10b981',
              borderBottomLeftRadius: '8px'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '28px',
              height: '28px',
              borderBottom: '3px solid #10b981',
              borderRight: '3px solid #10b981',
              borderBottomRightRadius: '8px'
            }}
          />

          {/* Animated Laser Scanning Line */}
          <div
            style={{
              position: 'absolute',
              left: '4px',
              right: '4px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #10b981, #38bdf8, transparent)',
              boxShadow: '0 0 12px #10b981, 0 0 24px #38bdf8',
              animation: 'scanSweep 2.2s ease-in-out infinite'
            }}
          />

          {/* Target Crosshair */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              border: '1px solid rgba(16, 185, 129, 0.7)',
              borderRadius: '50%'
            }}
          />
        </div>
      )}

      {/* Top Helper Hint */}
      <div
        style={{
          position: 'absolute',
          top: '75px',
          zIndex: 20,
          background: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '20px',
          padding: '6px 18px',
          color: '#e2e8f0',
          fontSize: '11px',
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
        }}
      >
        AIM AT ANY ROAMING WILD ANIMAL QR
      </div>

      {/* Camera Live Controls (when camera stream is running) */}
      {isScanning && (
        <div
          style={{
            position: 'absolute',
            top: '120px',
            right: '16px',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <button
            onClick={toggleCamera}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
          </button>
          {hasTorch && (
            <button
              onClick={toggleTorch}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: torchOn ? '#f59e0b' : 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: torchOn ? '#000000' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Zap size={16} />
            </button>
          )}
        </div>
      )}

      {/* Bottom Action Bar: Snap Photo & Manual Code */}
      <div
        style={{
          position: 'absolute',
          bottom: '150px',
          zIndex: 25,
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        {/* Universal Snap Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isDecodingFile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #10b981, #0284c7)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)'
          }}
        >
          <Camera size={18} />
          <span>{isDecodingFile ? 'ANALYZING...' : 'SNAP QR PHOTO'}</span>
        </button>

        {/* Code Input Toggle */}
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          style={{
            padding: '10px 14px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            borderRadius: '24px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Keyboard size={16} />
          <span>Code</span>
        </button>
      </div>

      {/* Manual Code Input Modal */}
      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          style={{
            position: 'absolute',
            bottom: '210px',
            zIndex: 35,
            background: '#090d16',
            border: '1px solid #10b981',
            borderRadius: '16px',
            padding: '14px',
            display: 'flex',
            gap: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.85)'
          }}
        >
          <input
            type="text"
            placeholder="Paste or enter Wildlife ID..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#020617',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
              width: '200px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: '#020617',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Tag
          </button>
        </form>
      )}

      {/* Bottom Floating Drawer: Active Targets (Tap to Document) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'rgba(9, 13, 22, 0.95)',
          borderTop: '1px solid rgba(16, 185, 129, 0.35)',
          borderTopLeftRadius: '22px',
          borderTopRightRadius: '22px',
          padding: '12px 16px 20px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 -6px 24px rgba(0,0,0,0.7)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={14} color="#10b981" />
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                fontWeight: '800',
                color: '#10b981',
                letterSpacing: '0.05em'
              }}
            >
              ACTIVE WILDLIFE IN SANCTUARY ({targets.length})
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Tap to document:</span>
        </div>

        {/* Scrollable Target Chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {targets.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#64748b', padding: '6px 0' }}>
              Waiting for wildlife to emerge...
            </div>
          ) : (
            targets.map((p) => {
              const isApex = p.isApex || p.isLegendary;
              return (
                <button
                  key={p.id}
                  onClick={() => onScan(p.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    background: isApex ? 'rgba(245, 158, 11, 0.22)' : 'rgba(15, 23, 42, 0.85)',
                    border: `1px solid ${isApex ? '#f59e0b' : p.color || 'rgba(16, 185, 129, 0.4)'}`,
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: p.color || '#10b981'
                    }}
                  />
                  <span>{p.name}</span>
                  {isApex && (
                    <span
                      style={{
                        fontSize: '9px',
                        background: '#f59e0b',
                        color: '#000',
                        padding: '0 4px',
                        borderRadius: '3px',
                        fontWeight: '900'
                      }}
                    >
                      👑
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
