import React from 'react';
import { KeyRound, Hash, CheckCircle2, XCircle, ShieldCheck, ShieldX, HelpCircle } from 'lucide-react';

export default function VerificationPanel({ verificationData, isTamperedMode }) {
  const {
    signatureStatus,
    signatureHex,
    signerKeyFingerprint,
    expectedSha256,
    calculatedSha256,
    checksumStatus,
    mismatchIndex
  } = verificationData;

  const renderHashWithMismatch = (hash, isCalculated = false) => {
    if (!hash) return <span style={{ color: 'var(--text-dim)' }}>Pending calculation...</span>;
    if (checksumStatus !== 'MISMATCH' || mismatchIndex === undefined || mismatchIndex < 0) {
      return <span>{hash}</span>;
    }

    // Highlight character mismatch point
    const before = hash.slice(0, mismatchIndex);
    const diffChar = hash[mismatchIndex];
    const after = hash.slice(mismatchIndex + 1);

    return (
      <span>
        {before}
        <span className="mismatch" title={`Mismatch detected at byte position ${mismatchIndex}`}>
          {diffChar}
        </span>
        {after}
      </span>
    );
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <KeyRound size={18} color="var(--accent-cyan)" />
          <span>ECU Cryptographic Hardware Verification Engine</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className={`status-pill ${signatureStatus === 'PASSED' ? 'passed' : signatureStatus === 'FAILED' ? 'failed' : 'busy'}`}>
            SIGNATURE: {signatureStatus || 'STANDBY'}
          </span>
          <span className={`status-pill ${checksumStatus === 'MATCH' ? 'passed' : checksumStatus === 'MISMATCH' ? 'failed' : 'busy'}`}>
            CHECKSUM: {checksumStatus || 'STANDBY'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* ECDSA Digital Signature Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--accent-cyan)" />
              1. Digital Signature Verification (ECDSA P-256)
            </span>
            {signatureStatus === 'PASSED' && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle2 size={14} /> PASSED
              </span>
            )}
            {signatureStatus === 'FAILED' && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <XCircle size={14} /> FAILED
              </span>
            )}
          </div>

          <div className="crypto-box">
            <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>
              OEM ROOT PUBLIC KEY FINGERPRINT (PRE-INSTALLED IN ECU TRUST STORE):
            </div>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              {signerKeyFingerprint || 'OEM_ACU_ROOT_CA_KEY_P256'}
            </div>

            <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>
              OTA PACKAGE SIGNATURE (DER ENCODED / HEX):
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
              {signatureHex ? `${signatureHex.slice(0, 48)}...${signatureHex.slice(-16)}` : 'Awaiting OTA package signature metadata...'}
            </div>
          </div>

          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            <strong>Authenticity & Non-Repudiation:</strong> The digital signature guarantees that the firmware originated exclusively from the certified OEM engineering authority.
          </p>
        </div>

        {/* SHA-256 Checksum Verification Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={16} color="var(--accent-cyan)" />
              2. SHA-256 Checksum Verification (Integrity)
            </span>
            {checksumStatus === 'MATCH' && (
              <span style={{ color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle2 size={14} /> MATCH (0 ERRORS)
              </span>
            )}
            {checksumStatus === 'MISMATCH' && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <XCircle size={14} /> MISMATCH DETECTED
              </span>
            )}
          </div>

          <div className="crypto-box">
            <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>
              EXPECTED SHA-256 (IN MANIFEST):
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              {expectedSha256 || 'Pending OTA download...'}
            </div>

            <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>
              CALCULATED SHA-256 (VIA BROWSER WEB CRYPTO API):
            </div>
            <div style={{ color: checksumStatus === 'MISMATCH' ? 'var(--accent-red)' : '#f1f5f9' }}>
              {renderHashWithMismatch(calculatedSha256, true)}
            </div>
          </div>

          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            <strong>Integrity Assurance:</strong> SHA-256 ensures bit-level integrity. Even a single flipped bit in calibration tables produces an entirely divergent hash.
          </p>
        </div>
      </div>
    </div>
  );
}
