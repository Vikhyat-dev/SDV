# Automotive Airbag Control Unit (ACU-01) — Signed OTA Update & Automatic Rollback Simulator

An educational software simulator demonstrating **secure signed Over-The-Air (OTA) firmware updates**, **real cryptographic verification (SHA-256 & ECDSA P-256)**, and **automatic rollback upon tamper detection**, strictly scoped to **one simulated Airbag Control Unit (ACU-01)**.

> **EDUCATIONAL SIMULATION NOTICE**  
> This application is strictly an educational software demonstration and conceptual simulator. It does NOT interact with or control an actual motor vehicle, physical airbag, CAN/LIN bus, diagnostic hardware (UDS/OBD-II), or safety-critical microcontroller.

---

## 1. Quick Start Guide

### Prerequisites
* **Node.js** (v18+ or v20+ recommended)
* **npm**

### Installation & Execution
```bash
# Navigate to the project root directory
cd d:/SDV

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

Open your browser and navigate to the displayed local address:
```
http://localhost:5173/
```

---

## 2. Core Project Features

1. **Strictly Scoped to One Airbag ECU (`ACU-01`)**:
   * Displays realistic ECU telemetry: ECU ID (`ACU-01`), Active Firmware version, ECU Status (`READY`, `REBOOTING`, `ROLLBACK`, `SAFE`), Power voltage, Firmware Integrity status, and Memory Slot assignment.
2. **Authentic Cryptographic Engine (Web Crypto API)**:
   * **No hardcoded booleans**: Uses browser-native `window.crypto.subtle`.
   * **ECDSA P-256 Digital Signatures**: Generates an asymmetric OEM Keypair, signs firmware packages with the OEM Private Key, and verifies authenticity using the ECU's pre-provisioned OEM Public Key.
   * **SHA-256 Hashing**: Calculates genuine 256-bit digests across the raw payload bytes to ensure bit-level integrity.
   * **Real Mathematical Failure**: When payloads are modified, the cryptographic avalanche effect alters the computed hash and breaks the digital signature mathematically.
3. **Automotive-Style A/B Dual-Slot Flash Architecture**:
   * **Slot A (Active Bank)**: Contains currently executing firmware (`v1.0.0` initial).
   * **Slot B (Update / Backup Bank)**: Preserves the known-good baseline firmware (`v1.0.0`) as an inviolable recovery source.
4. **Dynamic ECU Post-Update Health Check**:
   * Evaluates 4 targeted criteria sequentially:
     1. **Firmware Integrity Check**: Flash memory block consistency.
     2. **ECU Boot Success**: Bootloader reset vector & CPU register sanity.
     3. **Configuration Validation**: Calibration table parameters and target ID (`ACU-01`) match.
     4. **Simulated Diagnostic Self-Test**: Comprehensive internal ECU diagnostic self-test pass confirmation.
5. **Interactive Tamper Inspector & Live Diff Sandbox**:
   * Side-by-side comparison of genuine `v1.1.0` vs tampered `v1.1.0`.
   * Real-time interactive editor allowing you or your teacher to edit parameters or inject custom text and observe live recalculation of the SHA-256 hash.
6. **Real-Time Diagnostic Event Log**:
   * Timestamped engineering logs with level filters (`ALL`, `INFO`, `WARN`, `ERROR`), auto-scroll, and one-click clipboard copy.
7. **Pedagogical Viva Explainer & Built-In Presentation Modal**:
   * Dynamic contextual guidance explaining the current step in engineering terminology.
   * Direct access to the 2–3 minute spoken demonstration script and 10 high-probability viva Q&As.

---

## 3. Project Directory Structure

```text
d:/SDV/
├── index.html                    # HTML entry point with automotive fonts
├── package.json                  # Dependencies: react, react-dom, lucide-react, vite
├── vite.config.js                # Vite build configuration
├── src/
│   ├── main.jsx                  # Application bootstrapper
│   ├── App.jsx                   # Main layout, state coordinator, and event routing
│   ├── index.css                 # Automotive dark glassmorphism engineering theme
│   ├── data/
│   │   └── defaultFirmware.js    # Simulated baseline v1.0.0, genuine v1.1.0, and tampered payloads
│   ├── services/
│   │   ├── cryptoService.js      # Web Crypto API: SHA-256, ECDSA P-256 sign/verify, hash diffing
│   │   ├── ecuSimulator.js       # ACU-01 telemetry constants and initial state model
│   │   └── otaStateMachine.js    # Async state machine pipeline for valid and tampered flows
│   └── components/
│       ├── Header.jsx                # Header bar, UTC clock, status indicator, guide button
│       ├── ActionControls.jsx        # Big primary demo buttons, demo reset, speed selector
│       ├── ECUStatusCard.jsx         # ACU-01 telemetry and operational status
│       ├── StateMachinePipeline.jsx  # Visual pipeline tracker with pulsing state nodes
│       ├── VerificationPanel.jsx     # Real ECDSA signature and SHA-256 checksum comparator
│       ├── MemorySlotsVisualizer.jsx # Automotive-style A/B dual-slot memory visualizer
│       ├── HealthCheckCard.jsx       # Dynamic 4-point ECU post-update health check
│       ├── TamperDiffViewer.jsx      # Side-by-side payload diff and interactive live sandbox
│       ├── ArchitectureDiagram.jsx   # Visual system architecture schematic with active highlighting
│       ├── EventLog.jsx              # Timestamped event logger with filtering and copy button
│       ├── VivaExplainerPanel.jsx    # Real-time pedagogical commentary for teachers
│       └── VivaModal.jsx             # Modal containing spoken script and top 10 viva Q&As
```

---

## 4. How the Simulator Works

The simulator models an automotive Over-The-Air (OTA) update workflow between an OEM Cloud Server and an Airbag Control Unit (ACU-01):

```text
                 OEM OTA SERVER
                       |
               Signed Firmware (v1.1.0)
                       |
                       ↓
               OTA DOWNLOAD LINK
                       |
                       ↓
         ┌───────────────────────────────┐
         │     AIRBAG ECU [ACU-01]       │
         │                               │
         │  1. ECDSA Signature Verify    │
         │          ↓                    │
         │  2. SHA-256 Checksum Verify   │
         │          ↓                    │
         │  3. Backup v1.0.0 to Slot B   │
         │          ↓                    │
         │  4. Flash v1.1.0 to Slot A    │
         │          ↓                    │
         │  5. Reboot & Bootloader Handover│
         │          ↓                    │
         │  6. 4-Stage Health Check      │
         └───────────────────────────────┘
                       |
             SUCCESS / ROLLBACK
```

---

## 5. Walkthrough of the Two Core Demonstrations

### Demonstration 1: Valid Signed OTA Update
1. Click **"SIMULATE VALID OTA UPDATE"**.
2. **Download**: Firmware package `v1.1.0` streams into staging RAM (progress: 0% → 100%).
3. **Digital Signature Verification**: The ECU verifies the ECDSA P-256 signature using the OEM public key stored in its trust store. Status: **PASSED**.
4. **SHA-256 Checksum Calculation**: The ECU calculates the SHA-256 hash across the downloaded payload. Calculated hash matches expected hash bit-for-bit. Status: **MATCH**.
5. **A/B Dual-Slot Backup**: Active firmware `v1.0.0` is mirrored into Slot B (Backup Bank).
6. **Flash Sector Programming**: Firmware `v1.1.0` is written to Slot A (Active Bank).
7. **Reboot**: ECU simulates warm reboot and hands execution to updated reset vector.
8. **Post-Update Health Check**: The ECU executes the 4 sequential health checks (Firmware Integrity, ECU Boot Success, Configuration Validation, Diagnostic Self-Test). All pass.
9. **Outcome**: Firmware `v1.1.0` is declared active. ECU Status: **READY**.

### Demonstration 2: Tampered OTA Update & Automatic Rollback (Key Feature)
1. Click **"Demo Reset"**, then click **"SIMULATE TAMPERED OTA UPDATE"**.
2. **Download**: Candidate package begins downloading.
3. **Tamper Injection**: An adversary intercepts the stream and alters critical deployment parameters (e.g., lowering `DEPLOY_THRESHOLD_G` from `4.15` to `1.20` or corrupting calibration CRCs). The package metadata still retains the OEM's original expected signature and hash.
4. **Digital Signature Verification**: The ECU attempts to verify the signature on the modified bytes. Mathematical verification **FAILS**.
5. **SHA-256 Checksum Verification**: The ECU calculates the real SHA-256 digest of the tampered bytes. The computed hash completely diverges from the expected hash. Status: **MISMATCH DETECTED**.
6. **Security Abort**: The ECU bootloader security supervisor halts installation immediately. Untrusted code is blocked from touching physical flash.
7. **Automatic Rollback Triggered**: The bootloader initiates recovery by switching to Slot B (Backup Bank) where known-good firmware `v1.0.0` is preserved.
8. **Restoring Backup**: Firmware `v1.0.0` is restored into the active boot slot.
9. **Post-Rollback Health Check**: The ECU executes diagnostic self-tests on the restored `v1.0.0` baseline.
10. **Outcome**: The ECU returns to a **SAFE / READY** state running certified `v1.0.0`.

---

## 6. Digital Signature vs. Checksum Explained

| Mechanism | Technology | Primary Security Purpose | What It Detects |
| :--- | :--- | :--- | :--- |
| **Digital Signature** | ECDSA (P-256 / SHA-256) | **Authenticity & Non-Repudiation** | Proves the package originated from the certified OEM authority and was not forged by an attacker. |
| **Checksum / Hash** | SHA-256 (256-bit Digest) | **Bit-Level Integrity** | Detects accidental network corruption, flipped bits, or unauthorized byte modifications (avalanche effect). |

*Why both are needed*: If an attacker tampers with the firmware and also recalculates a matching checksum, the checksum would pass, but the attacker lacks the OEM's private signing key. Therefore, the digital signature will fail. Both checks are mandatory.

---

## 7. Spoken Demonstration Script (2–3 Minutes for Teacher)

> "Hello Professor. Today I am demonstrating our project: **Signed OTA Firmware Update Simulator for an Automotive Airbag Control Unit (ACU-01) with Checksum Verification and Automatic Rollback.**
> 
> **[Scope & Initial State]**  
> This project is an educational simulator strictly scoped to one safety-critical ECU: the Airbag Control Unit, ACU-01. As you can see on the dashboard, the ECU is initially running certified factory firmware version 1.0.0 in Slot A (Active Bank). We utilize an automotive-style A/B dual-slot flash architecture, where Slot B serves as an untouched recovery backup bank.
> 
> **[Demonstrating the Valid Flow]**  
> First, I will trigger a valid OTA update by clicking **SIMULATE VALID OTA UPDATE**.  
> The OEM Cloud broadcasts signed candidate firmware version 1.1.0. The ECU downloads the package into temporary staging RAM.  
> Next is the cryptographic gate: the ECU verifies the ECDSA P-256 digital signature using the pre-installed OEM public key, proving the update originated from the genuine manufacturer.  
> Then, using the browser's Web Crypto API, the ECU calculates the real SHA-256 checksum across the downloaded bytes and compares it with the manifest. Both checks pass.  
> Current firmware v1.0.0 is secured in Slot B, v1.1.0 is flashed into Slot A, and the ECU reboots. It performs a 4-point dynamic health check—Firmware Integrity, ECU Boot Success, Configuration Validation, and Diagnostic Self-Test. All 4 pass, and version 1.1.0 is active.
> 
> **[Demonstrating Tampering & Rollback]**  
> Now, I will demonstrate the core contribution of our project: the tampered failure case and automatic rollback. I will click **Demo Reset**, followed by **SIMULATE TAMPERED OTA UPDATE**.  
> In this scenario, an attacker intercepts the package in transit and alters key calibration parameters—such as lowering the deployment threshold G-force. Notice that the packet metadata still retains the OEM's original expected signature and hash.  
> When the ECU runs verification, the ECDSA signature verification FAILS, and the computed SHA-256 hash reports a MISMATCH.  
> Because of this cryptographic failure, the ECU's security supervisor immediately ABORTS installation. Untrusted code is never written to flash.  
> The bootloader triggers AUTOMATIC ROLLBACK, restoring known-good firmware version 1.0.0 from Slot B. Post-rollback health checks run, and the ECU safely returns to READY state running version 1.0.0.
> 
> In conclusion, our simulator proves that combining asymmetric digital signatures, SHA-256 hashing, and an A/B dual-slot memory architecture guarantees that a safety-critical Airbag ECU can never be compromised or bricked by a corrupted OTA transmission. Thank you!"

---

## 8. Top 10 Likely Viva Questions & Answers

1. **Q: Why does an Airbag ECU need both a Digital Signature and a SHA-256 Checksum?**  
   *A:* Digital Signatures (ECDSA P-256) prove **Authenticity** (the update came from the legitimate OEM). SHA-256 proves **Integrity** (not a single byte was corrupted or altered in transit).
2. **Q: How is this simulation mathematically genuine without being hardcoded?**  
   *A:* It uses the browser's native `window.crypto.subtle` Web Crypto API. Genuine ECDSA P-256 keys are generated, real SHA-256 byte digests are calculated, and cryptographic signature verification executes on actual payload strings.
3. **Q: What is an automotive-style A/B dual-slot flash architecture?**  
   *A:* Flash memory is split into two independent banks: Slot A (active) and Slot B (backup/update). If an update fails verification or boot, the bootloader instantly reverts execution to the known-good code in Slot B, preventing vehicle bricking.
4. **Q: What happens if an attacker tampers with the firmware and also changes the expected SHA-256 hash in the manifest?**  
   *A:* The attacker's modified hash might match their modified file, but they lack the OEM's private key. The ECU's ECDSA signature verification against the pre-installed OEM public key will fail.
5. **Q: Why should firmware never be flashed directly into active memory while downloading?**  
   *A:* If the network drops or the payload is corrupted mid-transfer, active flash would be left in an inconsistent state, rendering the vehicle's safety restraint system disabled. Staging RAM buffers prevent this.
6. **Q: What are the 4 checks in your Dynamic ECU Post-Update Health Check?**  
   *A:* 1) Firmware Integrity Check (flash block hash/CRC consistency), 2) ECU Boot Success (bootloader reset vector validation), 3) Configuration Validation (calibration tables and target ACU-01 ID match), and 4) Simulated Diagnostic Self-Test (internal ECU self-diagnostics pass).
7. **Q: Why is automatic rollback especially critical for an Airbag Control Unit?**  
   *A:* An Airbag Control Unit is a Class-A life-safety system. A bricked ACU leaves passengers completely unprotected in a crash. Automatic rollback ensures the vehicle immediately retains certified restraint deployment readiness.
8. **Q: What is the cryptographic "avalanche effect" in SHA-256?**  
   *A:* Changing even a single bit in the input message flips over 50% of the output hash bits. This makes any unauthorized calibration modification instantly detectable.
9. **Q: Where does the ECU store the OEM Public Key in a real vehicle?**  
   *A:* In a tamper-resistant Hardware Security Module (HSM) or Secure Hardware Extension (SHE) provisioned during factory manufacturing.
10. **Q: What automotive standards govern secure OTA software updates?**  
    *A:* UN ECE Regulation 156 (Software Update Management System - SUMS) and ISO 24089 (Road vehicles — Software update engineering).
