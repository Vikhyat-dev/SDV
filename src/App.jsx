import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ActionControls from './components/ActionControls';
import ECUStatusCard from './components/ECUStatusCard';
import StateMachinePipeline from './components/StateMachinePipeline';
import VerificationPanel from './components/VerificationPanel';
import HealthCheckCard from './components/HealthCheckCard';
import MemorySlotsVisualizer from './components/MemorySlotsVisualizer';
import TamperDiffViewer from './components/TamperDiffViewer';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import EventLog from './components/EventLog';
import VivaModal from './components/VivaModal';

import {
  INITIAL_ECU_STATE,
  OTA_STATES
} from './services/ecuSimulator';
import {
  runValidOtaFlow,
  runTamperedOtaFlow,
  delay
} from './services/otaStateMachine';
import {
  initializeOemAuthorityKeys,
  calculateSha256,
  getEcuTrustedPublicKey
} from './services/cryptoService';
import {
  FIRMWARE_V1_0_0,
  FIRMWARE_V1_1_0_GENUINE,
  FIRMWARE_V1_1_0_TAMPERED
} from './data/defaultFirmware';

export default function App() {
  // Simulator State
  const [ecuState, setEcuState] = useState(INITIAL_ECU_STATE);
  const [currentState, setCurrentState] = useState(OTA_STATES.IDLE);
  const [isRunning, setIsRunning] = useState(false);
  const [isTamperedMode, setIsTamperedMode] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [customTamperedPayload, setCustomTamperedPayload] = useState(FIRMWARE_V1_1_0_TAMPERED.payload);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  // Cryptographic Verification State
  const [verificationData, setVerificationData] = useState({
    signatureStatus: null,
    signatureHex: '',
    signerKeyFingerprint: '',
    expectedSha256: '',
    calculatedSha256: '',
    checksumStatus: null,
    mismatchIndex: undefined
  });

  // Diagnostic Logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '14:00:00.100 IST',
      level: 'info',
      message: 'Airbag ECU ACU-01 cold boot complete. ROM Vector: 0x00000000.'
    },
    {
      id: 2,
      timestamp: '14:00:00.250 IST',
      level: 'success',
      message: 'Slot A (Active Bank) verified: Firmware v1.0.0 (Build 2026.03.14-REV-A).'
    },
    {
      id: 3,
      timestamp: '14:00:00.320 IST',
      level: 'info',
      message: 'Automotive A/B Dual-Slot: Slot B verified as known-good recovery backup.'
    },
    {
      id: 4,
      timestamp: '14:00:00.410 IST',
      level: 'success',
      message: 'ECU Hardware Trust Store: OEM Root CA Key pre-provisioned. ECU Status: READY.'
    }
  ]);

  // Cancellation and Speed Refs for async flow handling
  const cancelFlagRef = useRef(false);
  const speedRef = useRef(speedMultiplier);
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Helper for Indian Standard Time string
  const getISTDateTime = () => {
    const d = new Date();
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const timeStr = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    return `${dateStr} ${timeStr} IST`;
  };

  // Log Dispatcher (Indian Standard Time)
  const addLog = useCallback((message, level = 'info') => {
    const now = new Date();
    const istTime = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const timeStr = `${istTime}.${ms} IST`;
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        timestamp: timeStr,
        level,
        message
      }
    ]);
  }, []);

  // Pre-initialize OEM Keys on mount
  useEffect(() => {
    initializeOemAuthorityKeys().then(async () => {
      const keyInfo = await getEcuTrustedPublicKey();
      const initialHash = await calculateSha256(FIRMWARE_V1_0_0.payload);
      setVerificationData((prev) => ({
        ...prev,
        signerKeyFingerprint: keyInfo.fingerprint,
        expectedSha256: initialHash,
        calculatedSha256: initialHash,
        checksumStatus: 'MATCH',
        signatureStatus: 'PASSED'
      }));
    });
  }, []);

  // Reset Simulator to Initial Baseline
  const handleReset = useCallback(() => {
    cancelFlagRef.current = true;
    setIsRunning(false);
    setIsTamperedMode(false);
    setCurrentState(OTA_STATES.IDLE);
    setDownloadProgress(0);
    setEcuState(INITIAL_ECU_STATE);

    calculateSha256(FIRMWARE_V1_0_0.payload).then((h) => {
      setVerificationData({
        signatureStatus: 'PASSED',
        signatureHex: '',
        signerKeyFingerprint: 'OEM_ACU_ROOT_CA_KEY_P256',
        expectedSha256: h,
        calculatedSha256: h,
        checksumStatus: 'MATCH',
        mismatchIndex: undefined
      });
    });

    addLog('--- SIMULATOR RESET TO BASELINE: ACU-01 v1.0.0 ACTIVE ---', 'warn');
  }, [addLog]);

  // State Change Dispatcher
  const handleStateChange = useCallback((newState, logMsg) => {
    setCurrentState(newState);
    if (logMsg) {
      addLog(logMsg, 'info');
    }

    setEcuState((prev) => {
      let ecuStatus = 'BUSY';
      let safetyState = prev.safetyState;

      if (newState === OTA_STATES.IDLE || newState === OTA_STATES.SUCCESS) {
        ecuStatus = 'READY';
        safetyState = 'NORMAL';
      } else if (newState === OTA_STATES.SAFE_READY) {
        ecuStatus = 'SAFE';
        safetyState = 'SAFE';
      } else if (newState === OTA_STATES.REBOOTING) {
        ecuStatus = 'REBOOTING';
      } else if (newState === OTA_STATES.TRIGGERING_ROLLBACK || newState === OTA_STATES.RESTORING_BACKUP) {
        ecuStatus = 'ROLLBACK';
        safetyState = 'DEGRADED';
      }

      return {
        ...prev,
        ecuStatus,
        safetyState,
        lastUpdateTimestamp: newState === OTA_STATES.SUCCESS || newState === OTA_STATES.SAFE_READY
          ? getISTDateTime()
          : prev.lastUpdateTimestamp
      };
    });
  }, [addLog]);

  // Memory Slot Dispatcher
  const handleMemorySlotUpdate = useCallback((slotsUpdate) => {
    setEcuState((prev) => ({
      ...prev,
      slotA: slotsUpdate.slotA ? { ...prev.slotA, ...slotsUpdate.slotA } : prev.slotA,
      slotB: slotsUpdate.slotB ? { ...prev.slotB, ...slotsUpdate.slotB } : prev.slotB,
      activeFirmware: slotsUpdate.slotA?.firmware ? slotsUpdate.slotA.firmware : prev.activeFirmware
    }));
  }, []);

  // Health Check Dispatcher
  const handleHealthCheckUpdate = useCallback((checkKey, status, details) => {
    setEcuState((prev) => ({
      ...prev,
      healthChecks: {
        ...prev.healthChecks,
        [checkKey]: {
          ...prev.healthChecks[checkKey],
          status,
          details: details || prev.healthChecks[checkKey].details
        }
      }
    }));
  }, []);

  // Verification Updates Dispatcher
  const handleVerificationUpdate = useCallback((update) => {
    setVerificationData((prev) => ({
      ...prev,
      ...update
    }));
  }, []);

  // RUN 1: VALID OTA UPDATE
  const handleRunValidUpdate = async () => {
    if (isRunning) return;
    cancelFlagRef.current = false;
    setIsRunning(true);
    setIsTamperedMode(false);
    setDownloadProgress(0);

    // Reset health check statuses to PENDING
    setEcuState((prev) => ({
      ...prev,
      healthChecks: {
        firmwareIntegrity: { ...prev.healthChecks.firmwareIntegrity, status: 'PENDING' },
        bootSuccess: { ...prev.healthChecks.bootSuccess, status: 'PENDING' },
        configValidation: { ...prev.healthChecks.configValidation, status: 'PENDING' },
        diagnosticSelfTest: { ...prev.healthChecks.diagnosticSelfTest, status: 'PENDING' }
      }
    }));

    addLog('=== STARTING SIMULATION: VALID SIGNED OTA UPDATE ===', 'info');

    await runValidOtaFlow({
      onStateChange: handleStateChange,
      onProgress: setDownloadProgress,
      onVerificationUpdate: handleVerificationUpdate,
      onHealthCheckUpdate: handleHealthCheckUpdate,
      onMemorySlotUpdate: handleMemorySlotUpdate,
      onLog: addLog,
      getSpeedMultiplier: () => speedRef.current,
      isCancelled: () => cancelFlagRef.current
    });

    setIsRunning(false);
  };

  // RUN 2: TAMPERED OTA UPDATE & AUTOMATIC ROLLBACK
  const handleRunTamperedUpdate = async () => {
    if (isRunning) return;
    cancelFlagRef.current = false;
    setIsRunning(true);
    setIsTamperedMode(true);
    setDownloadProgress(0);

    // Reset health check statuses to PENDING
    setEcuState((prev) => ({
      ...prev,
      healthChecks: {
        firmwareIntegrity: { ...prev.healthChecks.firmwareIntegrity, status: 'PENDING' },
        bootSuccess: { ...prev.healthChecks.bootSuccess, status: 'PENDING' },
        configValidation: { ...prev.healthChecks.configValidation, status: 'PENDING' },
        diagnosticSelfTest: { ...prev.healthChecks.diagnosticSelfTest, status: 'PENDING' }
      }
    }));

    addLog('=== STARTING SIMULATION: TAMPERED OTA UPDATE & AUTOMATIC ROLLBACK ===', 'warn');

    await runTamperedOtaFlow({
      customTamperedPayload,
      onStateChange: handleStateChange,
      onProgress: setDownloadProgress,
      onVerificationUpdate: handleVerificationUpdate,
      onHealthCheckUpdate: handleHealthCheckUpdate,
      onMemorySlotUpdate: handleMemorySlotUpdate,
      onLog: addLog,
      getSpeedMultiplier: () => speedRef.current,
      isCancelled: () => cancelFlagRef.current
    });

    setIsRunning(false);
  };

  // RUN 3: FULL AUTOMATED DEMO (Valid -> Pause -> Tampered)
  const handleRunFullDemo = async () => {
    if (isRunning) return;
    addLog('=== COMMENCING FULL ACADEMIC DEMONSTRATION ===', 'info');
    await handleRunValidUpdate();
    if (cancelFlagRef.current) return;

    addLog('Valid update successful. Pausing 3 seconds before Tampered Update scenario...', 'info');
    await delay(3000, speedRef.current);
    if (cancelFlagRef.current) return;

    addLog('Switching to Tampered Payload demonstration...', 'warn');
    await handleRunTamperedUpdate();
  };

  return (
    <div className="app-container">
      {/* System Header */}
      <Header onOpenVivaGuide={() => setIsVivaModalOpen(true)} />

      {/* Main Action Bar */}
      <ActionControls
        isRunning={isRunning}
        onRunValidUpdate={handleRunValidUpdate}
        onRunTamperedUpdate={handleRunTamperedUpdate}
        onRunFullDemo={handleRunFullDemo}
        onReset={handleReset}
        speedMultiplier={speedMultiplier}
        setSpeedMultiplier={setSpeedMultiplier}
      />

      {/* State Machine Execution Pipeline */}
      <StateMachinePipeline
        currentState={currentState}
        downloadProgress={downloadProgress}
        isTamperedMode={isTamperedMode}
      />

      {/* Primary ECU Status Card */}
      <ECUStatusCard ecuState={ecuState} currentState={currentState} />

      {/* Cryptographic Engine & A/B Memory */}
      <div className="grid-2">
        <VerificationPanel
          verificationData={verificationData}
          isTamperedMode={isTamperedMode}
        />
        <MemorySlotsVisualizer
          slotA={ecuState.slotA}
          slotB={ecuState.slotB}
          activeSlot={ecuState.activeSlot}
          isRollbackActive={
            currentState === OTA_STATES.TRIGGERING_ROLLBACK ||
            currentState === OTA_STATES.RESTORING_BACKUP ||
            currentState === OTA_STATES.POST_ROLLBACK_HEALTH_CHECK ||
            currentState === OTA_STATES.SAFE_READY
          }
        />
      </div>

      {/* Dynamic Health Check & Tamper Diff Viewer */}
      <div className="grid-2">
        <HealthCheckCard healthChecks={ecuState.healthChecks} />
        <TamperDiffViewer
          onCustomPayloadChange={setCustomTamperedPayload}
          isRunning={isRunning}
        />
      </div>

      {/* Architecture & Live Event Log */}
      <div className="grid-2">
        <ArchitectureDiagram
          currentState={currentState}
          isTamperedMode={isTamperedMode}
        />
        <EventLog
          logs={logs}
          onClearLogs={() => setLogs([])}
        />
      </div>

      {/* Presentation Script & Viva Q&A Modal */}
      <VivaModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />
    </div>
  );
}
