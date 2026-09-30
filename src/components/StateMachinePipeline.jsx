import React from 'react';
import { Activity, Check, X, ShieldAlert, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { OTA_STATES } from '../services/ecuSimulator';

export default function StateMachinePipeline({ currentState, downloadProgress, isTamperedMode }) {
  // Step definitions for the valid flow
  const validSteps = [
    { id: OTA_STATES.IDLE, label: 'Idle' },
    { id: OTA_STATES.UPDATE_AVAILABLE, label: 'Available' },
    { id: OTA_STATES.DOWNLOADING, label: 'Download' },
    { id: OTA_STATES.VERIFYING_SIGNATURE, label: 'ECDSA Verify' },
    { id: OTA_STATES.VERIFYING_CHECKSUM, label: 'SHA-256 Check' },
    { id: OTA_STATES.CREATING_BACKUP, label: 'A/B Backup' },
    { id: OTA_STATES.INSTALLING, label: 'Install' },
    { id: OTA_STATES.REBOOTING, label: 'Reboot' },
    { id: OTA_STATES.POST_UPDATE_HEALTH_CHECK, label: 'Health Check' },
    { id: OTA_STATES.SUCCESS, label: 'Success' },
  ];

  // Step definitions for the tampered rollback flow
  const tamperedSteps = [
    { id: OTA_STATES.DOWNLOADING, label: 'Download' },
    { id: OTA_STATES.TAMPER_INJECTED, label: 'Tampered' },
    { id: OTA_STATES.VERIFYING_SIGNATURE, label: 'Signature Fail' },
    { id: OTA_STATES.VERIFYING_CHECKSUM, label: 'Hash Mismatch' },
    { id: OTA_STATES.UPDATE_ABORTED, label: 'Aborted' },
    { id: OTA_STATES.TRIGGERING_ROLLBACK, label: 'Rollback' },
    { id: OTA_STATES.RESTORING_BACKUP, label: 'Restore v1.0' },
    { id: OTA_STATES.POST_ROLLBACK_HEALTH_CHECK, label: 'Safety Check' },
    { id: OTA_STATES.SAFE_READY, label: 'Safe / Ready' },
  ];

  const stepsToRender = isTamperedMode ? tamperedSteps : validSteps;

  const getStepState = (stepId, index) => {
    const currentIndex = stepsToRender.findIndex(s => s.id === currentState);
    if (currentIndex === -1) return 'pending';
    if (index < currentIndex) {
      if (stepId === OTA_STATES.TAMPER_INJECTED || stepId === OTA_STATES.UPDATE_ABORTED) {
        return 'failed';
      }
      return 'completed';
    }
    if (index === currentIndex) {
      if (currentState === OTA_STATES.TAMPER_INJECTED ||
          currentState === OTA_STATES.UPDATE_ABORTED ||
          currentState === OTA_STATES.TRIGGERING_ROLLBACK) {
        return 'failed';
      }
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <Activity size={18} color={isTamperedMode ? 'var(--accent-red)' : 'var(--accent-cyan)'} />
          <span>OTA Update State Machine & Execution Pipeline</span>
        </div>
        <span className={`card-badge ${isTamperedMode ? 'status-pill tampered' : ''}`}>
          {isTamperedMode ? 'BRANCH: INTEGRITY FAILURE & ROLLBACK' : 'BRANCH: NOMINAL SIGNED UPDATE'}
        </span>
      </div>

      {/* Progress bar when downloading */}
      {(currentState === OTA_STATES.DOWNLOADING || currentState === OTA_STATES.TAMPER_INJECTED) && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>OTA Package Download Transfer:</span>
            <span style={{ color: isTamperedMode ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
              {downloadProgress}% {downloadProgress === 100 ? 'COMPLETE' : 'TRANSFERRING'}
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className={`progress-fill ${isTamperedMode ? 'tampered' : ''}`}
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Pipeline track */}
      <div className="state-machine-track">
        {stepsToRender.map((step, idx) => {
          const stepStatus = getStepState(step.id, idx);
          return (
            <div key={step.id} className="state-step-node">
              <div className={`step-circle ${stepStatus}`}>
                {stepStatus === 'completed' && <Check size={16} />}
                {stepStatus === 'failed' && <X size={16} />}
                {stepStatus === 'active' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />}
                {stepStatus === 'pending' && <span style={{ fontSize: '0.7rem' }}>{idx + 1}</span>}
              </div>
              <span className={`step-label ${stepStatus === 'active' ? 'active' : ''}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Failure Callout Banner when in rollback flow */}
      {isTamperedMode && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.6rem 0.9rem',
          borderRadius: '0.375rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.78rem',
          color: '#fca5a5'
        }}>
          <ShieldAlert size={18} color="var(--accent-red)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Fail-Safe Security Rule Triggered:</strong> Untrusted or tampered firmware must never be permitted to flash or execute on safety-critical ACU hardware. Automatic fallback reverts to certified Slot B baseline.
          </span>
        </div>
      )}
    </div>
  );
}
