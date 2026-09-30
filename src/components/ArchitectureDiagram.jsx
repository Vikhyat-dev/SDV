import React from 'react';
import { Layers, Cloud, ArrowDown, Server, Shield, HardDrive, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { OTA_STATES } from '../services/ecuSimulator';

export default function ArchitectureDiagram({ currentState, isTamperedMode }) {
  const isServerActive = currentState === OTA_STATES.UPDATE_AVAILABLE;
  const isDownloadActive = currentState === OTA_STATES.DOWNLOADING || currentState === OTA_STATES.TAMPER_INJECTED;
  const isVerifyActive = currentState === OTA_STATES.VERIFYING_SIGNATURE || currentState === OTA_STATES.VERIFYING_CHECKSUM;
  const isFlashActive = currentState === OTA_STATES.CREATING_BACKUP || currentState === OTA_STATES.INSTALLING;
  const isRebootHealthActive = currentState === OTA_STATES.REBOOTING || currentState === OTA_STATES.POST_UPDATE_HEALTH_CHECK;
  const isSuccessActive = currentState === OTA_STATES.SUCCESS;
  const isRollbackActive = currentState === OTA_STATES.TRIGGERING_ROLLBACK ||
                           currentState === OTA_STATES.RESTORING_BACKUP ||
                           currentState === OTA_STATES.POST_ROLLBACK_HEALTH_CHECK ||
                           currentState === OTA_STATES.SAFE_READY;

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <Layers size={18} color="var(--accent-cyan)" />
          <span>Automotive OTA System & Security Architecture</span>
        </div>
        <span className="card-badge">
          SIMULATION ARCHITECTURE SCHEMATIC
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
        {/* OEM OTA Cloud Server */}
        <div style={{
          width: '100%',
          maxWidth: '540px',
          background: isServerActive ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
          border: `1px solid ${isServerActive ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cloud size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                OEM OTA CLOUD SERVER
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Firmware Builder • OEM Private Key (ECDSA P-256) • Manifest Registry
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            PORT 443 / TLS 1.3
          </span>
        </div>

        {/* Downward Transmission Link */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: isDownloadActive ? (isTamperedMode ? 'var(--accent-red)' : 'var(--accent-cyan)') : 'var(--text-dim)' }}>
          <ArrowDown size={18} className={isDownloadActive ? 'animate-bounce' : ''} />
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
            {isTamperedMode && isDownloadActive ? '⚠ MITM ATTACK / PACKET TAMPERING' : 'SIGNED OTA TRANSMISSION'}
          </span>
        </div>

        {/* Airbag ECU ACU-01 Container */}
        <div style={{
          width: '100%',
          maxWidth: '580px',
          background: 'rgba(17, 28, 53, 0.7)',
          border: '2px solid #2563eb',
          borderRadius: '0.65rem',
          padding: '1rem',
          boxShadow: '0 0 25px rgba(37, 99, 235, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Server size={16} /> AIRBAG CONTROL UNIT [ACU-01] BOUNDARY
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
              Hardware Trust Store: ARMED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {/* Box 1: Crypto Verification */}
            <div style={{
              background: isVerifyActive ? (isTamperedMode ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.2)') : 'var(--bg-input)',
              border: `1px solid ${isVerifyActive ? (isTamperedMode ? 'var(--accent-red)' : 'var(--accent-cyan)') : 'var(--border-color)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              fontSize: '0.74rem'
            }}>
              <div style={{ fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Shield size={14} color="var(--accent-cyan)" />
                Cryptographic Engine
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                • ECDSA P-256 Signature<br />
                • Real SHA-256 Checksum
              </div>
            </div>

            {/* Box 2: Memory Banks */}
            <div style={{
              background: isFlashActive ? 'rgba(16,185,129,0.15)' : 'var(--bg-input)',
              border: `1px solid ${isFlashActive ? 'var(--accent-green)' : 'var(--border-color)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              fontSize: '0.74rem'
            }}>
              <div style={{ fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <HardDrive size={14} color="var(--accent-green)" />
                A/B Flash Architecture
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                • Slot A: Active Bank<br />
                • Slot B: Backup Recovery
              </div>
            </div>

            {/* Box 3: Bootloader & Health Check */}
            <div style={{
              background: isRebootHealthActive ? 'rgba(56,189,248,0.15)' : 'var(--bg-input)',
              border: `1px solid ${isRebootHealthActive ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              fontSize: '0.74rem'
            }}>
              <div style={{ fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <RefreshCw size={14} color="var(--accent-cyan)" />
                Diagnostic Health Check
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                • Boot & Register sanity<br />
                • Internal Self-Test
              </div>
            </div>

            {/* Box 4: Rollback Supervisor */}
            <div style={{
              background: isRollbackActive ? 'rgba(239,68,68,0.2)' : 'var(--bg-input)',
              border: `1px solid ${isRollbackActive ? 'var(--accent-red)' : 'var(--border-color)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              fontSize: '0.74rem'
            }}>
              <div style={{ fontWeight: 600, color: isRollbackActive ? '#fca5a5' : '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldAlert size={14} color={isRollbackActive ? 'var(--accent-red)' : 'var(--accent-amber)'} />
                Rollback Supervisor
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                • Auto-swaps to Slot B<br />
                • Preserves SAFE state
              </div>
            </div>
          </div>
        </div>

        {/* Outcome Terminal Box */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '580px', justifyContent: 'center' }}>
          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.4rem',
            borderRadius: '0.375rem',
            background: isSuccessActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${isSuccessActive ? 'var(--accent-green)' : 'rgba(255,255,255,0.06)'}`,
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: isSuccessActive ? 'var(--accent-green)' : 'var(--text-dim)'
          }}>
            PATH A: SUCCESS → v1.1.0 ACTIVE
          </div>

          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.4rem',
            borderRadius: '0.375rem',
            background: isRollbackActive && currentState === OTA_STATES.SAFE_READY ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${isRollbackActive && currentState === OTA_STATES.SAFE_READY ? 'var(--accent-amber)' : 'rgba(255,255,255,0.06)'}`,
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: isRollbackActive && currentState === OTA_STATES.SAFE_READY ? 'var(--accent-amber)' : 'var(--text-dim)'
          }}>
            PATH B: FAIL → ROLLBACK TO v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
