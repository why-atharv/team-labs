/**
 * Wildlife Field Card & Biometric Telemetry Modal
 * teamLab Wildlife Living Sanctuary
 * Displays biometric sonar scan phase followed by full zoological field identification card.
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, Compass, Activity, Wind, Scale, Clock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { mobileAudio } from '../utils/hapticsAndAudio.js';

export function WildlifeFieldCardModal({ result, onClose }) {
  const [phase, setPhase] = useState('lock'); // 'lock' -> 'reveal'
  const isSuccess = result?.success;
  const animal = result?.animal || result?.pokemon;

  useEffect(() => {
    if (!isSuccess) {
      setPhase('reveal');
      return;
    }

    // Play 3 biometric sonar pings
    const timer1 = setTimeout(() => mobileAudio.playTelemetryLock(), 350);
    const timer2 = setTimeout(() => mobileAudio.playTelemetryLock(), 800);
    const timer3 = setTimeout(() => mobileAudio.playTelemetryLock(), 1300);

    // Final Field Card Reveal
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: [animal?.color || '#10b981', '#f59e0b', '#38bdf8', '#ffffff']
      });
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(revealTimer);
    };
  }, [isSuccess, animal]);

  if (!result) return null;

  const isApex = animal?.isApex || animal?.isLegendary;
  const isRare = animal?.rarity === 'rare';

  let statusColor = '#38bdf8';
  if (animal?.conservationStatus === 'Critically Endangered' || animal?.conservationStatus === 'Endangered') {
    statusColor = '#ef4444';
  } else if (animal?.conservationStatus === 'Vulnerable' || animal?.conservationStatus === 'Near Threatened') {
    statusColor = '#f59e0b';
  } else if (animal?.conservationStatus === 'Least Concern') {
    statusColor = '#10b981';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(2, 6, 23, 0.96)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease',
        overflowY: 'auto'
      }}
    >
      {/* ================= PHASE 1: BIOMETRIC TELEMETRY LOCK ================= */}
      {phase === 'lock' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* Pulsing Sonar Rings */}
          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              border: `2px solid ${animal?.color || '#10b981'}`,
              animation: 'sonarPing 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
              opacity: 0.75
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '1px dashed rgba(56, 189, 248, 0.6)',
              animation: 'spin 8s linear infinite'
            }}
          />

          {/* Biometric Scanner Reticle */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.9) 70%)',
              border: `3px solid ${animal?.color || '#10b981'}`,
              boxShadow: `0 0 35px ${animal?.color || '#10b981'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Compass size={48} color={animal?.color || '#10b981'} style={{ animation: 'pulse 1.2s infinite' }} />
          </div>

          <div
            style={{
              marginTop: '36px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              fontWeight: '700',
              color: '#38bdf8',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            ACQUIRING BIOMETRIC TELEMETRY...
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
            Matching species DNA biomarkers & habitat signature
          </div>
        </div>
      )}

      {/* ================= PHASE 2: REVEAL FIELD GUIDE CARD ================= */}
      {phase === 'reveal' && (
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'cardPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {isSuccess ? (
            /* Successful Wildlife Identification Card */
            <div
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.92)',
                border: `2px solid ${isApex ? '#f59e0b' : animal?.color || '#10b981'}`,
                boxShadow: `0 0 35px ${isApex ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: '24px',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* Header Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  background: isApex ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${isApex ? '#f59e0b' : '#10b981'}`,
                  color: isApex ? '#f59e0b' : '#10b981',
                  fontSize: '11px',
                  fontWeight: '800',
                  fontFamily: "'Space Mono', monospace",
                  marginBottom: '10px'
                }}
              >
                {isApex ? <Sparkles size={12} /> : <CheckCircle2 size={12} />}
                <span>{isApex ? 'APEX SOVEREIGN BEAST' : `${(animal.category || 'WILDLIFE').toUpperCase()} CATALOGED`}</span>
              </div>

              {/* Species Name */}
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: '900',
                  color: '#ffffff',
                  margin: '0 0 2px 0',
                  letterSpacing: '0.02em',
                  textShadow: `0 0 20px ${animal.color || '#10b981'}`
                }}
              >
                {animal.name}
              </h1>

              {/* Scientific Name */}
              {animal.scientificName && (
                <div
                  style={{
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: '#94a3b8',
                    marginBottom: '12px'
                  }}
                >
                  {animal.scientificName}
                </div>
              )}

              {/* Conservation Status Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: `1px solid ${statusColor}44`,
                  marginBottom: '16px'
                }}
              >
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Status:</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: statusColor,
                    fontFamily: "'Space Mono', monospace"
                  }}
                >
                  {animal.conservationStatus || 'Protected Species'}
                </span>
              </div>

              {/* Zoological Metrics Grid */}
              <div
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                {animal.baseStats?.speedKmH && (
                  <div
                    style={{
                      background: 'rgba(2, 6, 23, 0.7)',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left'
                    }}
                  >
                    <Wind size={16} color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>TOP SPEED</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
                        {animal.baseStats.speedKmH} km/h
                      </div>
                    </div>
                  </div>
                )}

                {animal.baseStats?.weightKg && (
                  <div
                    style={{
                      background: 'rgba(2, 6, 23, 0.7)',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left'
                    }}
                  >
                    <Scale size={16} color="#f59e0b" />
                    <div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>WEIGHT</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
                        {animal.baseStats.weightKg >= 1000
                          ? `${(animal.baseStats.weightKg / 1000).toFixed(1)} tonnes`
                          : `${animal.baseStats.weightKg} kg`}
                      </div>
                    </div>
                  </div>
                )}

                {animal.diet && (
                  <div
                    style={{
                      background: 'rgba(2, 6, 23, 0.7)',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left'
                    }}
                  >
                    <Activity size={16} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>DIET / TROPHIC</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#f8fafc' }}>
                        {animal.diet}
                      </div>
                    </div>
                  </div>
                )}

                {animal.baseStats?.lifespanYears && (
                  <div
                    style={{
                      background: 'rgba(2, 6, 23, 0.7)',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left'
                    }}
                  >
                    <Clock size={16} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>LIFESPAN</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
                        {animal.baseStats.lifespanYears} years
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Native Habitat */}
              {animal.habitat && (
                <div
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.6)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '11px',
                    color: '#cbd5e1',
                    marginBottom: '12px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ color: '#94a3b8', fontWeight: '700' }}>Native Biome: </span>
                  {animal.habitat}
                </div>
              )}

              {/* Behavioral Zoological Fact */}
              {animal.description && (
                <p
                  style={{
                    fontSize: '12px',
                    lineHeight: '1.5',
                    color: '#94a3b8',
                    margin: '0 0 18px 0',
                    fontStyle: 'normal'
                  }}
                >
                  "{animal.description}"
                </p>
              )}

              {/* Catalog to Journal Button */}
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: isApex
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 18px ${isApex ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                }}
              >
                <span>CATALOG IN FIELD GUIDE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* Rejection Card (Contested telemetry scan) */
            <div
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '2px solid #ef4444',
                boxShadow: '0 0 35px rgba(239, 68, 68, 0.35)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  color: '#ef4444'
                }}
              >
                <AlertTriangle size={32} />
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
                TELEMETRY CONTESTED
              </h2>

              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                {result.message || 'Another Field Ranger completed the telemetry lock first!'}
              </p>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                SCAN ANOTHER TARGET
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Backward compatibility alias
export const GotchaModal = WildlifeFieldCardModal;
