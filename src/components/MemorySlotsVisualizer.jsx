import React from 'react';
import { HardDrive, ArrowLeftRight, Check, AlertOctagon, RotateCcw, ShieldCheck } from 'lucide-react';

export default function MemorySlotsVisualizer({ slotA, slotB, activeSlot, isRollbackActive }) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <HardDrive size={18} color="var(--accent-cyan)" />
          <span>Automotive-Style A/B Dual-Slot Flash Architecture</span>
        </div>
        <span className="card-badge" style={{ color: isRollbackActive ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
          {isRollbackActive ? 'REVERTING TO SLOT B' : 'DUAL-BANK ISOLATION: ARMED'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Memory Slot A */}
        <div className={`memory-slot-card ${activeSlot === 'A' ? 'active-slot' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              SLOT A [Primary / Active Bank]
            </span>
            {activeSlot === 'A' && (
              <span className="status-pill ready" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                BOOT POINTER ACTIVE
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Firmware: <strong style={{ color: '#f1f5f9' }}>v{slotA.firmware.version}</strong>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Build: {slotA.firmware.build}
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Flash Bank State:</span>
            <span style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: slotA.status.includes('FLASH') ? 'var(--accent-cyan)' :
                     slotA.status.includes('ROLLBACK') ? 'var(--accent-red)' :
                     'var(--accent-green)'
            }}>
              {slotA.status}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Bank Integrity:</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: slotA.integrity === 'VERIFIED' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
              {slotA.integrity}
            </span>
          </div>
        </div>

        {/* Memory Slot B */}
        <div className={`memory-slot-card ${activeSlot === 'B' ? 'active-slot' : 'backup-slot'}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              SLOT B [Update / Backup Bank]
            </span>
            <span className="status-pill" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              RECOVERY SOURCE
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Firmware: <strong style={{ color: '#f1f5f9' }}>v{slotB.firmware.version}</strong>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Build: {slotB.firmware.build} (Known-Good Baseline)
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Flash Bank State:</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#34d399' }}>
              {slotB.status}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Bank Integrity:</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {slotB.integrity}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeftRight size={14} color="var(--accent-cyan)" />
        <span>
          <strong>Automotive A/B Partition Principle:</strong> If a newly flashed firmware package is corrupted or fails runtime verification, the ECU bootloader never bricks; it points back immediately to the untouched known-good partition in Slot B.
        </span>
      </div>
    </div>
  );
}
