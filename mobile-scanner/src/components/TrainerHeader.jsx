import React from 'react';
import { BookOpen, Compass } from 'lucide-react';

export function RangerHeader({
  rangerName,
  trainerName,
  isConnected,
  fieldGuideCount,
  pokedexCount,
  onOpenFieldGuide,
  onOpenPokedex
}) {
  const name = rangerName || trainerName || 'Field Ranger';
  const count = fieldGuideCount !== undefined ? fieldGuideCount : (pokedexCount || 0);
  const handleOpen = onOpenFieldGuide || onOpenPokedex;

  return (
    <header
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}
    >
      {/* Ranger Info & Sanctuary Status */}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(2, 6, 23, 0.85)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '30px',
          padding: '6px 14px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
          }}
        />
        <span
          style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#f8fafc',
            fontFamily: "'Space Mono', monospace"
          }}
        >
          {name}
        </span>
      </div>

      {/* Wildlife Field Guide Button */}
      <button
        onClick={handleOpen}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(2, 6, 23, 0.85)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '30px',
          padding: '6px 14px',
          color: '#10b981',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
        }}
      >
        <BookOpen size={16} />
        <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: "'Space Mono', monospace" }}>{count}</span>
      </button>
    </header>
  );
}

// Backward compatibility alias
export const TrainerHeader = RangerHeader;
