/**
 * ECU Simulator for Airbag Control Unit (ACU-01)
 * Scoped to ONE simulated Airbag ECU with:
 * - Automotive-style A/B dual-slot flash architecture
 * - Dynamic ECU Post-Update Health Check (4 criteria)
 * - Real-time state transitions and diagnostic telemetry
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

export const OTA_STATES = {
  IDLE: 'IDLE',
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  DOWNLOADING: 'DOWNLOADING',
  TAMPER_INJECTED: 'TAMPER_INJECTED',
  VERIFYING_SIGNATURE: 'VERIFYING_SIGNATURE',
  VERIFYING_CHECKSUM: 'VERIFYING_CHECKSUM',
  CREATING_BACKUP: 'CREATING_BACKUP',
  INSTALLING: 'INSTALLING',
  REBOOTING: 'REBOOTING',
  POST_UPDATE_HEALTH_CHECK: 'POST_UPDATE_HEALTH_CHECK',
  SUCCESS: 'SUCCESS',
  UPDATE_ABORTED: 'UPDATE_ABORTED',
  TRIGGERING_ROLLBACK: 'TRIGGERING_ROLLBACK',
  RESTORING_BACKUP: 'RESTORING_BACKUP',
  POST_ROLLBACK_HEALTH_CHECK: 'POST_ROLLBACK_HEALTH_CHECK',
  SAFE_READY: 'SAFE_READY'
};

export const INITIAL_ECU_STATE = {
  ecuId: 'ACU-01',
  systemName: 'Airbag Control Unit',
  activeSlot: 'A',
  activeFirmware: { ...FIRMWARE_V1_0_0, status: 'INSTALLED' },
  slotA: {
    slotId: 'Slot A (Active Bank)',
    firmware: { ...FIRMWARE_V1_0_0 },
    status: 'ACTIVE_BOOT',
    integrity: 'VERIFIED'
  },
  slotB: {
    slotId: 'Slot B (Backup Bank)',
    firmware: { ...FIRMWARE_V1_0_0 },
    status: 'BACKUP_PRESERVED',
    integrity: 'VERIFIED'
  },
  ecuStatus: 'READY', // READY | BUSY | REBOOTING | ROLLBACK | SAFE
  safetyState: 'NORMAL', // NORMAL | IN_UPDATE | DEGRADED | SAFE
  batteryVoltage: '12.6V',
  lastUpdateTimestamp: '2026-03-14 14:00:00 IST',
  healthChecks: {
    firmwareIntegrity: { name: 'Firmware Integrity Check', status: 'PASSED', details: 'Flash CRC32 / SHA-256 block consistency' },
    bootSuccess: { name: 'ECU Boot Success', status: 'PASSED', details: 'Bootloader reset vector & register sanity' },
    configValidation: { name: 'Configuration Validation', status: 'PASSED', details: 'Calibration table & ECU ID ACU-01 verified' },
    diagnosticSelfTest: { name: 'Simulated Diagnostic Self-Test', status: 'PASSED', details: 'Internal ACU self-test diagnostics clear' }
  }
};
