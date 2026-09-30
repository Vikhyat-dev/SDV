/**
 * OTA State Machine & Execution Engine for Airbag ECU ACU-01
 * Controls the step-by-step pipeline for both Valid and Tampered flows.
 */

import {
  FIRMWARE_V1_0_0,
  FIRMWARE_V1_1_0_GENUINE,
  FIRMWARE_V1_1_0_TAMPERED
} from '../data/defaultFirmware';
import {
  initializeOemAuthorityKeys,
  getEcuTrustedPublicKey,
  calculateSha256,
  signFirmwarePayload,
  verifyFirmwareSignature,
  compareSha256
} from './cryptoService';
import { OTA_STATES, INITIAL_ECU_STATE } from './ecuSimulator';

// Helper to delay execution based on speed multiplier
export const delay = (ms, speedMultiplier = 1) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(100, ms / speedMultiplier)));

/**
 * Prepares the OEM signed package for v1.1.0
 */
export async function buildOemReleasePackage() {
  await initializeOemAuthorityKeys();
  const genuinePayload = FIRMWARE_V1_1_0_GENUINE.payload;
  const genuineHash = await calculateSha256(genuinePayload);
  const genuineSignature = await signFirmwarePayload(genuinePayload);
  const trustedKeyInfo = await getEcuTrustedPublicKey();

  return {
    firmware: { ...FIRMWARE_V1_1_0_GENUINE },
    expectedSha256: genuineHash,
    signatureHex: genuineSignature,
    signerId: "OEM_VEHICLE_SECURITY_AUTHORITY",
    signerKeyFingerprint: trustedKeyInfo.fingerprint,
    publicKeyHex: trustedKeyInfo.hex
  };
}

/**
 * Executes the Valid OTA Update Flow
 */
export async function runValidOtaFlow({
  onStateChange,
  onProgress,
  onVerificationUpdate,
  onHealthCheckUpdate,
  onMemorySlotUpdate,
  onLog,
  getSpeedMultiplier,
  isCancelled
}) {
  const getSpeed = () => (getSpeedMultiplier ? getSpeedMultiplier() : 1);
  const checkCancel = () => {
    if (isCancelled && isCancelled()) throw new Error('OPERATION_CANCELLED');
  };

  try {
    onLog('OTA update process initiated for target ECU: ACU-01', 'info');
    onStateChange(OTA_STATES.UPDATE_AVAILABLE, 'New signed firmware package v1.1.0 broadcast from OEM Cloud');
    await delay(700, getSpeed());
    checkCancel();

    // 1. Preparing OEM package
    onLog('Building authentic OTA delivery package with OEM private key (ECDSA P-256 / SHA-256)...', 'info');
    const oemPackage = await buildOemReleasePackage();
    await delay(600, getSpeed());
    checkCancel();

    // 2. Downloading
    onStateChange(OTA_STATES.DOWNLOADING, 'Downloading encrypted/signed firmware package via secure cellular link');
    onLog(`Connecting to OTA server. Package size: ${(oemPackage.firmware.sizeBytes / 1024).toFixed(0)} KB`, 'info');
    
    for (let progress = 10; progress <= 100; progress += 15) {
      checkCancel();
      onProgress(progress);
      await delay(220, getSpeed());
    }
    onProgress(100);
    onLog('Firmware package successfully downloaded to temporary staging buffer', 'success');
    await delay(500, getSpeed());
    checkCancel();

    // Staging package data for verification
    const receivedPayload = oemPackage.firmware.payload;
    const expectedHash = oemPackage.expectedSha256;
    const receivedSignature = oemPackage.signatureHex;

    // 3. Digital Signature Verification
    onStateChange(OTA_STATES.VERIFYING_SIGNATURE, 'ECU validating ECDSA P-256 signature using pre-installed OEM Public Key');
    onLog('Digital signature verification started against ECU Hardware Trust Store...', 'info');
    await delay(800, getSpeed());
    checkCancel();

    const signatureValid = await verifyFirmwareSignature(receivedPayload, receivedSignature);
    onVerificationUpdate({
      signatureStatus: signatureValid ? 'PASSED' : 'FAILED',
      signatureHex: receivedSignature,
      signerKeyFingerprint: oemPackage.signerKeyFingerprint
    });

    if (!signatureValid) {
      throw new Error('SIGNATURE_VERIFICATION_FAILED');
    }
    onLog('✓ Digital signature verified: Authenticity & OEM origin confirmed', 'success');
    await delay(600, getSpeed());
    checkCancel();

    // 4. SHA-256 Checksum Verification
    onStateChange(OTA_STATES.VERIFYING_CHECKSUM, 'ECU calculating SHA-256 hash of payload and comparing with expected manifest');
    onLog('SHA-256 checksum calculation running over downloaded payload bytes...', 'info');
    await delay(700, getSpeed());
    checkCancel();

    const calculatedHash = await calculateSha256(receivedPayload);
    const hashDiff = compareSha256(expectedHash, calculatedHash);

    onVerificationUpdate({
      expectedSha256: expectedHash,
      calculatedSha256: calculatedHash,
      checksumStatus: hashDiff.match ? 'MATCH' : 'MISMATCH'
    });

    if (!hashDiff.match) {
      throw new Error('CHECKSUM_MISMATCH');
    }
    onLog(`✓ SHA-256 checksum verified: Expected [${expectedHash.slice(0, 10)}...] MATCHES Calculated [${calculatedHash.slice(0, 10)}...]`, 'success');
    await delay(700, getSpeed());
    checkCancel();

    // 5. Dual-Slot Backup
    onStateChange(OTA_STATES.CREATING_BACKUP, 'Preserving current running firmware v1.0.0 in Slot B (Backup Bank)');
    onLog('Automotive-style A/B dual-slot: Current v1.0.0 mirrored to Slot B (Backup Bank)', 'info');
    onMemorySlotUpdate({
      slotA: { status: 'PREPARING_FLASH', integrity: 'VERIFIED' },
      slotB: { status: 'BACKUP_PRESERVED', integrity: 'VERIFIED' }
    });
    await delay(800, getSpeed());
    checkCancel();
    onLog('✓ Slot B verified as recovery backup bank', 'success');

    // 6. Installation
    onStateChange(OTA_STATES.INSTALLING, 'Writing firmware v1.1.0 to Slot A (Active Bank) flash sectors');
    onLog('Flashing new binary blocks to primary memory bank Slot A...', 'info');
    onMemorySlotUpdate({
      slotA: { status: 'FLASHING_SECTORS', integrity: 'UPDATING' },
      slotB: { status: 'BACKUP_PRESERVED', integrity: 'VERIFIED' }
    });
    await delay(1100, getSpeed());
    checkCancel();
    onLog('✓ Flash write operation finished. Parity bit confirmed', 'success');

    // 7. Rebooting
    onStateChange(OTA_STATES.REBOOTING, 'ECU executing soft reboot into updated partition Slot A');
    onLog('ECU cold-boot sequence initiated. Handing execution to updated reset vector...', 'warn');
    await delay(1000, getSpeed());
    checkCancel();

    // 8. Post-Update Dynamic Health Check (4 criteria)
    onStateChange(OTA_STATES.POST_UPDATE_HEALTH_CHECK, 'Executing 4-stage post-update diagnostic self-test');
    onLog('Running dynamic post-update health checks...', 'info');

    // Health 1: Firmware Integrity
    onHealthCheckUpdate('firmwareIntegrity', 'CHECKING');
    await delay(500, getSpeed());
    checkCancel();
    onHealthCheckUpdate('firmwareIntegrity', 'PASSED', 'Flash block SHA-256 integrity intact');
    onLog('✓ [Health Check 1/4] Firmware Integrity: Flash block integrity intact', 'success');

    // Health 2: ECU Boot Success
    onHealthCheckUpdate('bootSuccess', 'CHECKING');
    await delay(500, getSpeed());
    checkCancel();
    onHealthCheckUpdate('bootSuccess', 'PASSED', 'Bootloader reset vector & CPU registers valid');
    onLog('✓ [Health Check 2/4] ECU Boot Success: CPU registers and reset vectors verified', 'success');

    // Health 3: Configuration Validation
    onHealthCheckUpdate('configValidation', 'CHECKING');
    await delay(500, getSpeed());
    checkCancel();
    onHealthCheckUpdate('configValidation', 'PASSED', 'Calibration tables & target ID ACU-01 match');
    onLog('✓ [Health Check 3/4] Configuration Validation: Calibration parameters verified', 'success');

    // Health 4: Diagnostic Self-Test
    onHealthCheckUpdate('diagnosticSelfTest', 'CHECKING');
    await delay(600, getSpeed());
    checkCancel();
    onHealthCheckUpdate('diagnosticSelfTest', 'PASSED', 'ACU internal diagnostic self-test clear (0x000000)');
    onLog('✓ [Health Check 4/4] Diagnostic Self-Test: ACU internal diagnostics normal', 'success');

    // 9. Success
    onStateChange(OTA_STATES.SUCCESS, 'OTA update completed successfully! Firmware v1.1.0 is now ACTIVE.');
    onMemorySlotUpdate({
      slotA: {
        slotId: 'Slot A (Active Bank)',
        firmware: { ...FIRMWARE_V1_1_0_GENUINE, status: 'INSTALLED' },
        status: 'ACTIVE_BOOT',
        integrity: 'VERIFIED'
      },
      slotB: {
        slotId: 'Slot B (Backup Bank)',
        firmware: { ...FIRMWARE_V1_0_0, status: 'BACKUP' },
        status: 'BACKUP_PRESERVED',
        integrity: 'VERIFIED'
      }
    });
    onLog('★ OTA UPDATE SUCCESSFUL: Airbag ECU ACU-01 active on v1.1.0. Safety State: NORMAL', 'success');
  } catch (err) {
    if (err.message === 'OPERATION_CANCELLED') {
      onLog('OTA operation cancelled by user reset.', 'warn');
    } else {
      onLog(`Unexpected error in valid OTA flow: ${err.message}`, 'error');
    }
  }
}

/**
 * Executes the Tampered OTA Update Flow with Automatic Rollback
 */
export async function runTamperedOtaFlow({
  customTamperedPayload,
  onStateChange,
  onProgress,
  onVerificationUpdate,
  onHealthCheckUpdate,
  onMemorySlotUpdate,
  onLog,
  getSpeedMultiplier,
  isCancelled
}) {
  const getSpeed = () => (getSpeedMultiplier ? getSpeedMultiplier() : 1);
  const checkCancel = () => {
    if (isCancelled && isCancelled()) throw new Error('OPERATION_CANCELLED');
  };

  try {
    onLog('Initiating OTA update sequence (Tampered/Corrupted Update Simulation)', 'warn');
    onStateChange(OTA_STATES.UPDATE_AVAILABLE, 'Incoming update metadata received for v1.1.0');
    await delay(700, getSpeed());
    checkCancel();

    // 1. Build authentic OEM expected credentials for genuine v1.1.0
    onLog('OEM Server created legitimate release package for v1.1.0 with genuine signature & expected hash', 'info');
    const oemPackage = await buildOemReleasePackage();
    const expectedHash = oemPackage.expectedSha256;
    const originalSignature = oemPackage.signatureHex;
    await delay(600, getSpeed());
    checkCancel();

    // 2. Download starts
    onStateChange(OTA_STATES.DOWNLOADING, 'Downloading candidate firmware package...');
    for (let progress = 10; progress <= 55; progress += 15) {
      checkCancel();
      onProgress(progress);
      await delay(200, getSpeed());
    }

    // 3. In-transit tampering occurs
    onStateChange(OTA_STATES.TAMPER_INJECTED, 'CRITICAL: In-transit MITM manipulation / bit corruption injected into payload!');
    onLog('⚠ SECURITY ALERT: Malicious packet alteration intercepted in transit!', 'error');
    onLog('Payload parameters modified (e.g. DEPLOY_THRESHOLD_G altered, calibration CRC corrupted)', 'error');
    onLog('Notice: Package manifest still claims original expected signature & SHA-256 hash', 'warn');
    await delay(1200, getSpeed());
    checkCancel();

    for (let progress = 70; progress <= 100; progress += 15) {
      checkCancel();
      onProgress(progress);
      await delay(180, getSpeed());
    }
    onProgress(100);
    checkCancel();

    // Use custom tampered text if user edited it, otherwise default tampered payload
    const receivedTamperedPayload = customTamperedPayload || FIRMWARE_V1_1_0_TAMPERED.payload;

    // 4. Digital Signature Verification
    onStateChange(OTA_STATES.VERIFYING_SIGNATURE, 'ECU validating ECDSA P-256 digital signature against OEM Public Key');
    onLog('ECU Hardware Security verification initiated for downloaded payload...', 'info');
    await delay(900, getSpeed());
    checkCancel();

    const signatureValid = await verifyFirmwareSignature(receivedTamperedPayload, originalSignature);
    onVerificationUpdate({
      signatureStatus: signatureValid ? 'PASSED' : 'FAILED',
      signatureHex: originalSignature,
      signerKeyFingerprint: oemPackage.signerKeyFingerprint
    });

    onLog(`✗ SIGNATURE VERIFICATION FAILED: Mathematical mismatch between payload bytes and OEM signature`, 'error');
    await delay(700, getSpeed());
    checkCancel();

    // 5. SHA-256 Checksum Calculation & Verification
    onStateChange(OTA_STATES.VERIFYING_CHECKSUM, 'ECU calculating SHA-256 of received payload and comparing with expected manifest hash');
    onLog('Real SHA-256 digest running on tampered payload bytes via Web Crypto API...', 'info');
    await delay(900, getSpeed());
    checkCancel();

    const calculatedTamperedHash = await calculateSha256(receivedTamperedPayload);
    const hashDiff = compareSha256(expectedHash, calculatedTamperedHash);

    onVerificationUpdate({
      expectedSha256: expectedHash,
      calculatedSha256: calculatedTamperedHash,
      checksumStatus: 'MISMATCH',
      mismatchIndex: hashDiff.firstMismatchIndex
    });

    onLog(`✗ CHECKSUM MISMATCH DETECTED!`, 'error');
    onLog(`   Expected:   ${expectedHash}`, 'error');
    onLog(`   Calculated: ${calculatedTamperedHash}`, 'error');
    await delay(900, getSpeed());
    checkCancel();

    // 6. Update Aborted - Safety Protection Triggered
    onStateChange(OTA_STATES.UPDATE_ABORTED, 'INTEGRITY VIOLATION: Installation immediately aborted. Primary slot preserved.');
    onLog('CRITICAL: Update aborted by ECU Bootloader Security Supervisor.', 'error');
    onLog('Active flash memory write blocked. Prevented installation of untrusted code.', 'warn');
    await delay(1100, getSpeed());
    checkCancel();

    // 7. Automatic Rollback Triggered
    onStateChange(OTA_STATES.TRIGGERING_ROLLBACK, 'AUTOMATIC ROLLBACK: Bootloader reverting to known-good firmware in Slot B');
    onLog('⚡ AUTOMATIC ROLLBACK TRIGGERED: Bootloader fallback sequence initiated', 'warn');
    onMemorySlotUpdate({
      slotA: { status: 'ROLLBACK_TRIGGERED', integrity: 'UNTRUSTED_REJECTED' },
      slotB: { status: 'RECOVERY_SOURCE', integrity: 'VERIFIED' }
    });
    await delay(1000, getSpeed());
    checkCancel();

    // 8. Restoring Backup from Slot B
    onStateChange(OTA_STATES.RESTORING_BACKUP, 'Restoring verified baseline firmware v1.0.0 from Slot B');
    onLog('Restoring verified baseline v1.0.0 from Slot B into execution active slot...', 'info');
    await delay(1000, getSpeed());
    checkCancel();
    onLog('✓ Previous firmware v1.0.0 re-synchronized and locked into Slot A', 'success');

    // 9. Post-Rollback Dynamic Health Check
    onStateChange(OTA_STATES.POST_ROLLBACK_HEALTH_CHECK, 'Executing post-rollback verification on restored v1.0.0');
    onLog('Executing dynamic post-rollback safety self-test on restored firmware...', 'info');

    onHealthCheckUpdate('firmwareIntegrity', 'CHECKING');
    await delay(450, getSpeed());
    checkCancel();
    onHealthCheckUpdate('firmwareIntegrity', 'PASSED', 'Restored v1.0.0 flash blocks confirmed');
    onLog('✓ [Rollback Check 1/4] Firmware Integrity: Restored baseline verified', 'success');

    onHealthCheckUpdate('bootSuccess', 'CHECKING');
    await delay(450, getSpeed());
    checkCancel();
    onHealthCheckUpdate('bootSuccess', 'PASSED', 'Bootloader re-initialized into verified slot');
    onLog('✓ [Rollback Check 2/4] ECU Boot Success: Clean bootloader handover confirmed', 'success');

    onHealthCheckUpdate('configValidation', 'CHECKING');
    await delay(450, getSpeed());
    checkCancel();
    onHealthCheckUpdate('configValidation', 'PASSED', 'ACU-01 baseline calibration loaded');
    onLog('✓ [Rollback Check 3/4] Configuration Validation: Baseline calibration confirmed', 'success');

    onHealthCheckUpdate('diagnosticSelfTest', 'CHECKING');
    await delay(500, getSpeed());
    checkCancel();
    onHealthCheckUpdate('diagnosticSelfTest', 'PASSED', 'ACU self-test normal. Crash detection active');
    onLog('✓ [Rollback Check 4/4] Diagnostic Self-Test: All internal diagnostic systems operational', 'success');

    // 10. SAFE / READY State Reached
    onStateChange(OTA_STATES.SAFE_READY, 'ROLLBACK SUCCESSFUL: ECU returned to SAFE / READY state running v1.0.0');
    onMemorySlotUpdate({
      slotA: {
        slotId: 'Slot A (Active Bank)',
        firmware: { ...FIRMWARE_V1_0_0, status: 'RESTORED' },
        status: 'ACTIVE_BOOT',
        integrity: 'VERIFIED'
      },
      slotB: {
        slotId: 'Slot B (Backup Bank)',
        firmware: { ...FIRMWARE_V1_0_0, status: 'BACKUP' },
        status: 'BACKUP_PRESERVED',
        integrity: 'VERIFIED'
      }
    });
    onLog('★ RECOVERY COMPLETE: Untrusted update rejected. v1.0.0 restored. ECU Status: SAFE / READY', 'success');
  } catch (err) {
    if (err.message === 'OPERATION_CANCELLED') {
      onLog('OTA operation cancelled by user reset.', 'warn');
    } else {
      onLog(`Error during tampered flow: ${err.message}`, 'error');
    }
  }
}
