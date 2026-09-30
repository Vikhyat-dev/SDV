import React, { useState, useEffect } from 'react';
import { FileCode, AlertTriangle, ShieldCheck, ShieldAlert, Edit3, RefreshCw } from 'lucide-react';
import { FIRMWARE_V1_1_0_GENUINE, FIRMWARE_V1_1_0_TAMPERED } from '../data/defaultFirmware';
import { calculateSha256 } from '../services/cryptoService';

export default function TamperDiffViewer({ onCustomPayloadChange, isRunning }) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [editablePayload, setEditablePayload] = useState(FIRMWARE_V1_1_0_TAMPERED.payload);
  const [liveSha256, setLiveSha256] = useState('');
  const [genuineSha256, setGenuineSha256] = useState('');

  // Calculate live hash when text changes
  useEffect(() => {
    let isMounted = true;
    calculateSha256(FIRMWARE_V1_1_0_GENUINE.payload).then((h) => {
      if (isMounted) setGenuineSha256(h);
    });
    calculateSha256(editablePayload).then((h) => {
      if (isMounted) setLiveSha256(h);
    });
    return () => { isMounted = false; };
  }, [editablePayload]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setEditablePayload(newText);
    if (onCustomPayloadChange) {
      onCustomPayloadChange(newText);
    }
  };

  const handleResetToDefaultTamper = () => {
    setEditablePayload(FIRMWARE_V1_1_0_TAMPERED.payload);
    if (onCustomPayloadChange) {
      onCustomPayloadChange(FIRMWARE_V1_1_0_TAMPERED.payload);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <FileCode size={18} color="var(--accent-red)" />
          <span>Firmware Tampering & Payload Diff Inspector</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
            onClick={() => setIsCustomMode(!isCustomMode)}
            disabled={isRunning}
            title="Toggle interactive live payload editing sandbox"
          >
            <Edit3 size={13} />
            <span>{isCustomMode ? 'Exit Live Sandbox' : 'Open Live Tamper Sandbox'}</span>
          </button>
          <span className="card-badge" style={{ color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            AVALANCHE EFFECT DEMO
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        <strong>Visualizing Payload Modification:</strong> When even a single byte or deployment parameter is altered by an adversary, the SHA-256 hash changes completely (cryptographic avalanche effect), causing both signature and checksum verification to fail mathematically.
      </p>

      {/* Side by side diff */}
      <div className="diff-container">
        {/* Genuine column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> Genuine OEM Release (v1.1.0)
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              Hash: {genuineSha256 ? `${genuineSha256.slice(0, 10)}...` : '...'}
            </span>
          </div>
          <pre className="diff-pane original">
{`[CALIBRATION_PARAMETERS]
DEPLOY_THRESHOLD_G=4.15           <-- [CERTIFIED SAFE VALUE]
FRONTAL_CRASH_WINDOW_MS=28
STAGE2_DELAY_MS=12
CRASH_ALGORITHM=MULTI_AXIS_DECEL_V2_ENHANCED
DIAGNOSTIC_PROTOCOL=UDS_ISO14229_R2

[SAFETY_CONSTRAINTS]
SQUIB_CHECK_INTERVAL_MS=250
MAX_DEPLOY_VOLTAGE_V=24.8
CAN_BUS_SYNC_HZ=100
CALIBRATION_TABLE_CRC=0x9E2B5F11  <-- [OEM CALIBRATION CRC]

[SECURITY_TAG]
KEY_STORE_VER=1.1
SIGNER=OEM_VEHICLE_SECURITY_AUTHORITY`}
          </pre>
        </div>

        {/* Tampered column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={14} /> Intercepted / Tampered Payload
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>
              Hash: {liveSha256 ? `${liveSha256.slice(0, 10)}...` : '...'}
            </span>
          </div>

          {isCustomMode ? (
            <textarea
              value={editablePayload}
              onChange={handleTextChange}
              disabled={isRunning}
              style={{
                width: '100%',
                height: '240px',
                background: 'var(--bg-input)',
                border: '1px solid var(--accent-red)',
                borderRadius: '0.5rem',
                color: '#fca5a5',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                padding: '0.75rem',
                resize: 'none'
              }}
            />
          ) : (
            <pre className="diff-pane tampered">
{`[CALIBRATION_PARAMETERS]
DEPLOY_THRESHOLD_G=1.20   <-- [TAMPERED: DANGEROUS PREMATURE TRIGGER]
FRONTAL_CRASH_WINDOW_MS=28
STAGE2_DELAY_MS=12
CRASH_ALGORITHM=UNAUTHORIZED_CODE_INJECTION
DIAGNOSTIC_PROTOCOL=UDS_ISO14229_R2

[SAFETY_CONSTRAINTS]
SQUIB_CHECK_INTERVAL_MS=9999 <-- [TAMPERED: SENSOR POLLING DISABLED]
MAX_DEPLOY_VOLTAGE_V=24.8
CAN_BUS_SYNC_HZ=100
CALIBRATION_TABLE_CRC=0xDEADBEEF <-- [TAMPERED: CORRUPTED CRC]

[SECURITY_TAG]
KEY_STORE_VER=1.1
SIGNER=OEM_VEHICLE_SECURITY_AUTHORITY`}
            </pre>
          )}

          {isCustomMode && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                Type in the box above to see real-time SHA-256 calculation update!
              </span>
              <button
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                onClick={handleResetToDefaultTamper}
              >
                Reset Default Tamper
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
