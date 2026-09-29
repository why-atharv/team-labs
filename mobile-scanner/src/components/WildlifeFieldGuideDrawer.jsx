/**
 * Wildlife Field Guide & Expedition Journal Drawer
 * teamLab Wildlife Living Sanctuary
 * Stores and categorizes all documented wild animals with complete biological facts.
 */

import React, { useState } from 'react';
import { X, Sparkles, Wind, Scale, Compass, Filter } from 'lucide-react';

export function WildlifeFieldGuideDrawer({ isOpen, onClose, fieldGuide = [], pokedex = [] }) {
  const [filterCategory, setFilterCategory] = useState('all');

  if (!isOpen) return null;

  const list = fieldGuide.length > 0 ? fieldGuide : pokedex;

  const filtered = list.filter((item) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'apex') return item.isApex || item.isLegendary;
    return item.category === filterCategory;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '84vh',
          background: '#090d16',
          borderTop: '2px solid rgba(16, 185, 129, 0.45)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.85)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '0.04em' }}>
              WILDLIFE FIELD GUIDE
            </h3>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px', fontFamily: "'Space Mono', monospace" }}>
              {list.length} WILD SPECIES DOCUMENTED
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              color: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '10px'
          }}
        >
          {[
            { id: 'all', label: 'All Species' },
            { id: 'apex', label: '👑 Apex Beasts' },
            { id: 'predator', label: 'Predators' },
            { id: 'megaherbivore', label: 'Giants' },
            { id: 'raptor', label: 'Raptors' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: '700',
                border: filterCategory === cat.id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                background: filterCategory === cat.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: filterCategory === cat.id ? '#10b981' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of Documented Wild Animals */}
        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '2px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌿</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>No species cataloged yet!</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Point your scanner at the sanctuary display or tap any active creature below to document it.
              </div>
            </div>
          ) : (
            filtered.map((animal, idx) => {
              const isApex = animal.isApex || animal.isLegendary;
              let statusColor = '#38bdf8';
              if (animal.conservationStatus === 'Critically Endangered' || animal.conservationStatus === 'Endangered') {
                statusColor = '#ef4444';
              } else if (animal.conservationStatus === 'Vulnerable' || animal.conservationStatus === 'Near Threatened') {
                statusColor = '#f59e0b';
              } else if (animal.conservationStatus === 'Least Concern') {
                statusColor = '#10b981';
              }

              return (
                <div
                  key={`${animal.id}_${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: `1px solid ${isApex ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: animal.color || '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        color: '#000000',
                        fontSize: '18px',
                        boxShadow: `0 0 12px ${animal.color || '#10b981'}44`
                      }}
                    >
                      {animal.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '14px' }}>
                          {animal.name}
                        </span>
                        {isApex && (
                          <span
                            style={{
                              fontSize: '8px',
                              background: '#f59e0b',
                              color: '#000',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontWeight: '900'
                            }}
                          >
                            APEX
                          </span>
                        )}
                      </div>
                      {animal.scientificName && (
                        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#94a3b8', marginTop: '1px' }}>
                          {animal.scientificName}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '9px',
                          color: statusColor,
                          fontWeight: '700',
                          fontFamily: "'Space Mono', monospace",
                          marginTop: '3px'
                        }}
                      >
                        {animal.conservationStatus || 'Protected'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {animal.baseStats?.speedKmH && (
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '11px',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <Wind size={11} />
                        <span>{animal.baseStats.speedKmH} km/h</span>
                      </div>
                    )}
                    {animal.baseStats?.weightKg && (
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <Scale size={10} />
                        <span>{animal.baseStats.weightKg >= 1000 ? `${(animal.baseStats.weightKg / 1000).toFixed(1)}t` : `${animal.baseStats.weightKg}kg`}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const PokedexDrawer = WildlifeFieldGuideDrawer;
