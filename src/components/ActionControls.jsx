import React from 'react';
import { Play, ShieldAlert, RotateCcw, Zap, FastForward } from 'lucide-react';

export default function ActionControls({
  isRunning,
  onRunValidUpdate,
  onRunTamperedUpdate,
  onRunFullDemo,
  onReset,
  speedMultiplier,
  setSpeedMultiplier
}) {
  return (
    <div className="action-bar">
      <div className="primary-actions">
        {/* BUTTON 1: VALID OTA UPDATE */}
        <button
          className="btn-valid"
          onClick={onRunValidUpdate}
          disabled={isRunning}
          title="Simulate complete valid OTA update flow (download, ECDSA verify, SHA-256 verify, A/B backup, install, reboot, health check, success)"
        >
          <Play size={18} fill="currentColor" />
          <span>SIMULATE VALID OTA UPDATE</span>
        </button>

        {/* BUTTON 2: TAMPERED OTA UPDATE */}
        <button
          className="btn-tampered"
          onClick={onRunTamperedUpdate}
          disabled={isRunning}
          title="Simulate tampered OTA update with automatic rollback (download, tampering detection, hash/signature mismatch, abort, restore backup, safe state)"
        >
          <ShieldAlert size={18} />
          <span>SIMULATE TAMPERED OTA UPDATE</span>
        </button>

        {/* FULL DEMONSTRATION BUTTON */}
        <button
          className="btn-secondary"
          onClick={onRunFullDemo}
          disabled={isRunning}
          style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
          title="Sequentially run Valid OTA flow followed by Tampered Update & Automatic Rollback"
        >
          <Zap size={16} />
          <span>Run Full Automated Demo</span>
        </button>

        {/* DEMO RESET */}
        <button
          className="btn-secondary"
          onClick={onReset}
          title="Reset ECU to initial baseline state (v1.0.0, Slot A Active, READY)"
        >
          <RotateCcw size={15} />
          <span>Demo Reset</span>
        </button>
      </div>

      {/* Presentation Speed Multiplier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Demo Speed:
        </span>
        <div className="speed-control">
          <button
            className={`speed-btn ${speedMultiplier === 0.6 ? 'active' : ''}`}
            onClick={() => setSpeedMultiplier(0.6)}
            title="Slower pace: ideal for explaining steps to teacher"
          >
            0.5x Slow
          </button>
          <button
            className={`speed-btn ${speedMultiplier === 1.0 ? 'active' : ''}`}
            onClick={() => setSpeedMultiplier(1.0)}
            title="Default normal speed"
          >
            1.0x Normal
          </button>
          <button
            className={`speed-btn ${speedMultiplier === 2.2 ? 'active' : ''}`}
            onClick={() => setSpeedMultiplier(2.2)}
            title="Faster pace: quick testing"
          >
            2.0x Fast
          </button>
        </div>
      </div>
    </div>
  );
}
