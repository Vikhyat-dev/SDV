import React from 'react';
import { HelpCircle, Info, Sparkles, BookOpen } from 'lucide-react';
import { OTA_STATES } from '../services/ecuSimulator';

export default function VivaExplainerPanel({ currentState, isTamperedMode, onOpenVivaModal }) {
  const getExplanation = () => {
    switch (currentState) {
      case OTA_STATES.IDLE:
        return {
          title: "System Ready / Baseline Established",
          text: "The simulated Airbag Control Unit (ACU-01) is currently operating on certified factory firmware v1.0.0 in Slot A (Active Bank). Slot B preserves a verified recovery backup. Deployment logic is armed and safe.",
          vivaTip: "Tell your teacher: 'Initially, the ECU runs factory baseline v1.0.0 with full hardware trust pre-provisioned.'"
        };

      case OTA_STATES.UPDATE_AVAILABLE:
        return {
          title: "OTA Broadcast & Manifest Staging",
          text: "The OEM Cloud has released a new firmware patch (v1.1.0) with enhanced rollover discrimination. The update manifest includes the target ECU ID (ACU-01), the expected SHA-256 hash, and the OEM's cryptographic signature.",
          vivaTip: "Explain: 'OTA packages are never pushed as raw code; they are packaged with cryptographic metadata.'"
        };

      case OTA_STATES.DOWNLOADING:
        return {
          title: "Secure Firmware Package Download",
          text: "The candidate firmware package is being streamed over the simulated telematics connection into a temporary staging RAM buffer. The primary flash memory remains untouched during download.",
          vivaTip: "Crucial point: 'Downloading into staging RAM prevents premature corruption of executing airbag firmware.'"
        };

      case OTA_STATES.TAMPER_INJECTED:
        return {
          title: "⚠ Malicious MITM Attack / In-Transit Corruption",
          text: "An adversary or network bit-flip has altered key calibration values in the payload (e.g. lowering the airbag deployment threshold or corrupting calibration CRCs). The package metadata still claims the original OEM signature.",
          vivaTip: "Highlight: 'Even though only a few bytes changed, the cryptographic signature and hash will immediately flag this.'"
        };

      case OTA_STATES.VERIFYING_SIGNATURE:
        return {
          title: "ECDSA Digital Signature Verification (Authenticity)",
          text: isTamperedMode
            ? "The ECU attempts to verify the payload with its pre-installed OEM Public Key using ECDSA P-256. Because the payload bytes were tampered, the signature verification FAILS mathematically."
            : "The ECU verifies that the package was signed by the OEM's certified private key using ECDSA P-256. This confirms authenticity and non-repudiation.",
          vivaTip: "Difference to know: 'Digital signatures verify WHO created the file; checksums verify that it was NOT corrupted.'"
        };

      case OTA_STATES.VERIFYING_CHECKSUM:
        return {
          title: "SHA-256 Checksum Calculation (Integrity)",
          text: isTamperedMode
            ? "The ECU independently runs SHA-256 over the received payload bytes. The calculated hash diverges completely from the expected hash. A bit-level integrity violation is flagged!"
            : "The ECU calculates the SHA-256 hash of the received bytes using the browser's Web Crypto API and confirms bit-for-bit equality with the expected manifest hash.",
          vivaTip: "Viva answer: 'SHA-256 exhibits the avalanche effect—changing 1 bit in payload alters >50% of hash bits.'"
        };

      case OTA_STATES.CREATING_BACKUP:
        return {
          title: "Automotive-Style A/B Dual-Slot Partition Backup",
          text: "Before writing the new version, the currently operational firmware (v1.0.0) is mirrored into Slot B (Backup Bank). This ensures the vehicle always retains a guaranteed fallback option.",
          vivaTip: "Explain: 'A/B dual-slot memory eliminates bricked ECUs in case of flash interruptions or failures.'"
        };

      case OTA_STATES.INSTALLING:
        return {
          title: "Flash Sector Programming (Slot A)",
          text: "Because both signature and checksum passed, the bootloader flashes the verified v1.1.0 code into Slot A (Active Bank) and validates block parity.",
          vivaTip: "Point out: 'Only cryptographically verified packages are permitted to touch physical flash memory.'"
        };

      case OTA_STATES.REBOOTING:
        return {
          title: "ECU Reset & Bootloader Handover",
          text: "The microcontroller executes a warm/cold reset. The bootloader inspects the boot vector of Slot A and initiates execution of the newly flashed v1.1.0 binary.",
          vivaTip: "Key stage: 'The ECU must re-initialize its registers and safety timers under the updated code.'"
        };

      case OTA_STATES.POST_UPDATE_HEALTH_CHECK:
        return {
          title: "Dynamic ECU Post-Update Diagnostic Self-Test",
          text: "The ECU executes 4 sequential health checks: 1) Flash Firmware Integrity, 2) ECU Boot Success, 3) Configuration & ACU-01 ID Validation, and 4) Diagnostic Self-Test.",
          vivaTip: "Emphasize: 'Passing cryptographic checks is step 1; runtime diagnostic validation is step 2.'"
        };

      case OTA_STATES.SUCCESS:
        return {
          title: "★ OTA Update Successful (v1.1.0 Active)",
          text: "The new firmware v1.1.0 has passed all cryptographic and diagnostic hurdles. Slot A is declared active, Slot B holds the rollback baseline, and ECU status is READY.",
          vivaTip: "Summary: 'The update succeeded with zero vehicle downtime and complete cryptographic proof.'"
        };

      case OTA_STATES.UPDATE_ABORTED:
        return {
          title: "🛑 Critical Security Abort (Installation Blocked)",
          text: "Because signature verification failed or a hash mismatch occurred, the ECU security supervisor immediately aborts the update. Untrusted code is never written to flash.",
          vivaTip: "Crucial safety rule: 'In an airbag system, flashing untrusted code could cause accidental deployment or failure to fire.'"
        };

      case OTA_STATES.TRIGGERING_ROLLBACK:
        return {
          title: "⚡ Automatic Rollback Triggered",
          text: "The update failed integrity verification. The bootloader marks the candidate binary as invalid and automatically executes the rollback supervisor to restore safe operation.",
          vivaTip: "Key requirement: 'The ECU does not crash or stay offline; it automatically initiates self-recovery.'"
        };

      case OTA_STATES.RESTORING_BACKUP:
        return {
          title: "Restoring Known-Good Baseline (v1.0.0)",
          text: "The bootloader switches execution pointers back to Slot B or restores the verified v1.0.0 factory image into Slot A.",
          vivaTip: "Point out: 'Slot B acts as the inviolable safety net preserving the vehicle's operational readiness.'"
        };

      case OTA_STATES.POST_ROLLBACK_HEALTH_CHECK:
        return {
          title: "Post-Rollback Diagnostic Validation",
          text: "The ECU verifies that the restored v1.0.0 baseline executes properly and that all internal diagnostic self-test registers report normal status.",
          vivaTip: "Safety proof: 'The ECU re-validates itself even after rolling back to ensure no residual corruption.'"
        };

      case OTA_STATES.SAFE_READY:
        return {
          title: "🛡️ ECU Returned to SAFE / READY State",
          text: "Rollback is complete. The tampered firmware was rejected, previous firmware v1.0.0 is fully restored, and the Airbag Control Unit is once again in a SAFE and READY state.",
          vivaTip: "Final demonstration point: 'The vehicle safety system remains 100% operational despite an active attack!'"
        };

      default:
        return {
          title: "ACU-01 Monitoring Active",
          text: "Awaiting next operator command.",
          vivaTip: "Select either Valid Update or Tampered Update."
        };
    }
  };

  const info = getExplanation();

  return (
    <div className="dashboard-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
      <div className="card-header">
        <div className="card-title">
          <Info size={18} color="var(--accent-cyan)" />
          <span>Viva Explainer & Academic Guide: "{info.title}"</span>
        </div>
        <button
          className="btn-secondary"
          onClick={onOpenVivaModal}
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: 'var(--accent-cyan)', borderColor: 'rgba(56, 189, 248, 0.4)' }}
        >
          <BookOpen size={13} />
          <span>Full Viva Q&A & Script</span>
        </button>
      </div>

      <div style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.6rem' }}>
        {info.text}
      </div>

      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px dashed rgba(56, 189, 248, 0.3)',
        borderRadius: '0.375rem',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.76rem',
        color: '#93c5fd'
      }}>
        <Sparkles size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
        <span><strong>Teacher Viva Tip:</strong> {info.vivaTip}</span>
      </div>
    </div>
  );
}
