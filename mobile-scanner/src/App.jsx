import React, { useState } from 'react';
import { useMobileSocket } from './hooks/useMobileSocket.js';
import { ScannerView } from './components/ScannerView.jsx';
import { WildlifeFieldCardModal } from './components/WildlifeFieldCardModal.jsx';
import { WildlifeFieldGuideDrawer } from './components/WildlifeFieldGuideDrawer.jsx';
import { RangerHeader } from './components/TrainerHeader.jsx';
import './index.css';

export default function App() {
  const [rangerName] = useState(() => {
    try {
      const saved = localStorage.getItem('teamlab_ranger_name') || localStorage.getItem('teamlab_trainer_name');
      if (saved) return saved.replace('Trainer', 'Ranger');
      const num = Math.floor(Math.random() * 900) + 100;
      const name = `Ranger_${num}`;
      localStorage.setItem('teamlab_ranger_name', name);
      return name;
    } catch {
      return 'Ranger_77';
    }
  });

  const [showFieldGuide, setShowFieldGuide] = useState(false);

  const {
    isConnected,
    isCapturing,
    captureResult,
    activeAnimals,
    fieldGuide,
    sendScan,
    clearCaptureResult
  } = useMobileSocket(rangerName);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#020617'
      }}
    >
      {/* Top Header Bar */}
      <RangerHeader
        rangerName={rangerName}
        isConnected={isConnected}
        fieldGuideCount={fieldGuide.length}
        onOpenFieldGuide={() => setShowFieldGuide(true)}
      />

      {/* Primary Scanner View (freezes/stops when capturing or modal open) */}
      <ScannerView
        onScan={sendScan}
        isPaused={isCapturing || !!captureResult}
        activeAnimals={activeAnimals}
      />

      {/* Official Wildlife Field Identification Card & Biometric Telemetry Modal */}
      <WildlifeFieldCardModal
        result={captureResult}
        onClose={clearCaptureResult}
      />

      {/* Living Wildlife Field Guide & Expedition Journal Drawer */}
      <WildlifeFieldGuideDrawer
        isOpen={showFieldGuide}
        onClose={() => setShowFieldGuide(false)}
        fieldGuide={fieldGuide}
      />
    </div>
  );
}
