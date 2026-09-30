import React, { useState } from 'react';
import { X, BookOpen, MessageSquare, Award, Shield, Check, Copy } from 'lucide-react';

export default function VivaModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('script');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptText = `Hello Professor. Today I am demonstrating our project: "Signed OTA Firmware Update Simulator for an Automotive Airbag Control Unit (ACU-01) with Checksum Verification and Automatic Rollback."

[PART 1: INTRODUCING THE SCOPE]
This project is an educational software simulator strictly scoped to one safety-critical ECU: the Airbag Control Unit, ACU-01. In an automotive system, the airbag controller is critical because an incorrect or corrupted firmware update could cause accidental deployment or failure to trigger in a crash.

As you can see on the dashboard, the ECU is initially running certified factory firmware version 1.0.0 in Slot A (Active Bank). We utilize an automotive-style A/B dual-slot flash architecture, where Slot B serves as a verified recovery backup bank.

[PART 2: DEMONSTRATING THE VALID OTA FLOW]
Now, I will trigger the valid OTA update by clicking "SIMULATE VALID OTA UPDATE".
1. The OEM Cloud broadcasts signed candidate firmware version 1.1.0.
2. The ECU downloads the package into temporary staging memory.
3. Next is the cryptographic gate: the ECU verifies the ECDSA P-256 digital signature using the OEM public key stored in the ECU trust store. This mathematically proves the update originated from the genuine manufacturer.
4. The ECU then computes a real SHA-256 hash using the Web Crypto API across the payload bytes and compares it bit-for-bit with the expected manifest hash.
5. With both checks passed, current firmware v1.0.0 is secured in Slot B, and v1.1.0 is flashed to Slot A.
6. The ECU reboots and executes a 4-point dynamic health check: Firmware Integrity, ECU Boot Success, Configuration Validation, and Diagnostic Self-Test.
7. All 4 checks pass, and version 1.1.0 is successfully declared ACTIVE.

[PART 3: DEMONSTRATING THE ATTACK & AUTOMATIC ROLLBACK]
Now, I will demonstrate the core contribution of our project: the tampered failure case and automatic rollback. I will click "Demo Reset", followed by "SIMULATE TAMPERED OTA UPDATE".
1. A new update package is downloaded, but an adversary intercepts and modifies key calibration parameters—such as altering the deployment threshold G-force or corrupting calibration CRCs.
2. Notice that the packet metadata still retains the OEM's original expected signature and hash.
3. The ECU's cryptographic engine runs ECDSA verification: FAILED!
4. The ECU calculates the SHA-256 hash of the modified bytes: MISMATCH DETECTED!
5. Because of this cryptographic failure, the ECU's security supervisor immediately ABORTS installation. The untrusted code is never written to flash.
6. The bootloader immediately triggers AUTOMATIC ROLLBACK, restoring known-good firmware version 1.0.0 from Slot B.
7. Post-rollback health checks run, and the ECU safely returns to READY state running version 1.0.0.

In conclusion, our simulator proves that combining asymmetric digital signatures, SHA-256 hashing, and an A/B dual-slot memory architecture guarantees that a safety-critical Airbag ECU can never be compromised or bricked by a corrupted OTA transmission. Thank you!`;

  const vivaQuestions = [
    {
      q: "1. Why does an Airbag ECU need both a Digital Signature and a SHA-256 Checksum?",
      a: "They solve two complementary security requirements: Digital Signatures (ECDSA P-256) provide Authenticity and Non-Repudiation (proving the package came from the legitimate OEM and not an attacker). SHA-256 provides Integrity (detecting any corrupted, missing, or altered bytes during transmission)."
    },
    {
      q: "2. How is this simulation mathematically genuine without being hardcoded?",
      a: "We use the browser's native Web Crypto API (`window.crypto.subtle`). Genuine ECDSA P-256 keys are generated, real SHA-256 byte digests are calculated, and cryptographic signature verification executes on actual payload strings. Modifying even one byte in the payload produces a completely different SHA-256 hash (avalanche effect) and causes signature verification to fail mathematically."
    },
    {
      q: "3. What is an automotive-style A/B dual-slot flash architecture?",
      a: "It divides ECU flash memory into two independent partitions: Slot A (currently active and executing) and Slot B (update / backup recovery bank). If a new firmware update fails verification, interrupts during download, or crashes during boot, the bootloader can instantly roll back execution to the untouched known-good firmware in Slot B, eliminating any chance of bricking."
    },
    {
      q: "4. What happens if an attacker tampers with the firmware and also changes the expected SHA-256 hash in the manifest?",
      a: "The attacker might match their own SHA-256 hash, BUT they do not have the OEM's private signing key. Therefore, the ECU's ECDSA digital signature verification will fail against the pre-installed OEM public key. Both checks must pass for installation to proceed."
    },
    {
      q: "5. Why should firmware never be flashed directly into active memory while downloading?",
      a: "If the connection drops or the payload is malicious, the active firmware would already be partially overwritten or corrupted, rendering the vehicle's safety system non-functional. Instead, firmware is downloaded to a staging buffer, verified cryptographically, and only then flashed."
    },
    {
      q: "6. What are the 4 checks in your Dynamic ECU Post-Update Health Check?",
      a: "1) Firmware Integrity Check (flash block hash/CRC consistency), 2) ECU Boot Success (bootloader reset vector and CPU register validation), 3) Configuration Validation (calibration tables and ACU-01 target ID match), and 4) Simulated Diagnostic Self-Test (internal ECU self-diagnostics pass)."
    },
    {
      q: "7. Why is automatic rollback especially critical for an Airbag Control Unit compared to an infotainment ECU?",
      a: "An infotainment ECU failure is an inconvenience, but an Airbag Control Unit is a Class-A life-safety system. A non-functioning or bricked ACU leaves passengers completely unprotected in a collision. Automatic rollback ensures the vehicle immediately retains certified restraint deployment readiness."
    },
    {
      q: "8. What is the cryptographic 'avalanche effect' observed in SHA-256?",
      a: "A fundamental property of cryptographic hash functions where altering even a single bit in the input message results in a drastically different, seemingly random output hash (>50% of the bits flip). This makes it computationally impossible for an attacker to tamper with calibration data unnoticed."
    },
    {
      q: "9. Where does the ECU store the OEM Public Key in a real vehicle?",
      a: "In real automotive controllers, the OEM Public Key or root certificate is provisioned during factory manufacturing into a tamper-resistant Hardware Security Module (HSM) or Secure Hardware Extension (SHE), protected against unauthorized modification."
    },
    {
      q: "10. What standards govern secure automotive OTA and software updates?",
      a: "UN ECE Regulation 156 (Software Update Management System - SUMS) and ISO 24089 (Road vehicles — Software update engineering), alongside ISO/SAE 21434 for automotive cybersecurity."
    }
  ];

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#f8fafc' }}>
              Academic Presentation Script & Viva Examination Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('script')}
            className={`btn-secondary ${activeTab === 'script' ? 'active' : ''}`}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderColor: activeTab === 'script' ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: activeTab === 'script' ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            <MessageSquare size={14} />
            <span>2–3 Min Demonstration Script</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`btn-secondary ${activeTab === 'viva' ? 'active' : ''}`}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderColor: activeTab === 'viva' ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: activeTab === 'viva' ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            <Shield size={14} />
            <span>Top 10 Viva Questions & Answers</span>
          </button>
        </div>

        {/* Tab 1: Script */}
        {activeTab === 'script' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Speak this word-for-word or use as talking points while clicking the buttons:
              </span>
              <button
                className="btn-secondary"
                onClick={handleCopyScript}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
              >
                {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Script'}</span>
              </button>
            </div>
            <pre style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              padding: '1rem',
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxHeight: '52vh',
              overflowY: 'auto'
            }}>
              {scriptText}
            </pre>
          </div>
        )}

        {/* Tab 2: Viva Q&A */}
        {activeTab === 'viva' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {vivaQuestions.map((item, index) => (
              <div key={index} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.8rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                  {item.q}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
