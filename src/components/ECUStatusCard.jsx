import React from 'react';
import { Cpu, ShieldCheck, BatteryCharging, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function ECUStatusCard({ ecuState, currentState }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'READY':
      case 'SAFE':
        return 'ready';
      case 'REBOOTING':
      case 'ROLLBACK':
        return 'rebooting';
      case 'BUSY':
      case 'DOWNLOADING':
      case 'VERIFYING':
      case 'INSTALLING':
        return 'busy';
      case 'FAILED':
      case 'ABORTED':
        return 'failed';
      default:
        return 'ready';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <Cpu size={18} color="var(--accent-cyan)" />
          <span>Simulated Airbag Control Unit (ACU-01)</span>
        </div>
        <span className={`status-pill ${getStatusClass(ecuState.ecuStatus)}`}>
          ● ECU STATUS: {ecuState.ecuStatus}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="metric-box">
          <span className="metric-label">ECU Identifier</span>
          <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
            {ecuState.ecuId}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {ecuState.systemName}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Active Firmware</span>
          <span className="metric-value" style={{ color: '#38bdf8' }}>
            v{ecuState.activeFirmware.version}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Build: {ecuState.activeFirmware.build}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Safety State</span>
          <span className="metric-value" style={{ color: ecuState.safetyState === 'NORMAL' || ecuState.safetyState === 'SAFE' ? '#34d399' : '#fbbf24' }}>
            {ecuState.safetyState}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Deployment Logic: ARMED
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Firmware Integrity</span>
          <span className="metric-value" style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={16} />
            <span>{ecuState.slotA.integrity}</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Active Slot: {ecuState.activeSlot}
          </span>
        </div>
      </div>

      {/* Secondary metrics row */}
      <div className="metrics-row" style={{ marginTop: '0.75rem' }}>
        <div className="metric-box" style={{ padding: '0.5rem 0.75rem' }}>
          <span className="metric-label">ECU Supply Voltage</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <BatteryCharging size={14} color="#34d399" />
            <span>{ecuState.batteryVoltage} (Nominal)</span>
          </span>
        </div>

        <div className="metric-box" style={{ padding: '0.5rem 0.75rem' }}>
          <span className="metric-label">Current Pipeline Phase</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
            {currentState.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="metric-box" style={{ padding: '0.5rem 0.75rem' }}>
          <span className="metric-label">Recovery Backup Status</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#a855f7' }}>
            Slot B: PRESERVED (v{ecuState.slotB.firmware.version})
          </span>
        </div>

        <div className="metric-box" style={{ padding: '0.5rem 0.75rem' }}>
          <span className="metric-label">Last Validated Event</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {ecuState.lastUpdateTimestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
