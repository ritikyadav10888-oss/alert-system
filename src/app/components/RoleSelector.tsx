"use client";

import React, { useState } from 'react';
import { Shield, Users, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import styles from '../page.module.css';

interface RoleSelectorProps {
    onSelect: (role: 'owner' | 'manager', location: string) => void;
    locations: string[];
}

export default function RoleSelector({ onSelect, locations }: RoleSelectorProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [role, setRole] = useState<'owner' | 'manager' | null>(null);
    const [selectedLoc, setSelectedLoc] = useState('');
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');

    const handleRoleSelect = (selectedRole: 'owner' | 'manager') => {
        setRole(selectedRole);
        if (selectedRole === 'owner') {
            setStep(2);
        } else {
            setStep(2);
        }
    };

    const handleComplete = () => {
        if (role === 'manager' && !selectedLoc) {
            setError('Please select a location');
            return;
        }

        // Simple passcode check (default: 0000)
        if (passcode !== '0000') {
            setError('Incorrect Passcode');
            return;
        }

        onSelect(role!, role === 'owner' ? 'All Locations' : selectedLoc);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.roleModal}>
                <div className={styles.modalHeader}>
                    <h2>Setup Identity</h2>
                    <p>Who is using this device?</p>
                </div>

                {step === 1 ? (
                    <div className={styles.roleOptions}>
                        <button
                            className={`${styles.roleCard} ${role === 'owner' ? styles.active : ''}`}
                            onClick={() => handleRoleSelect('owner')}
                        >
                            <div className={styles.roleIcon} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                <Shield color="#3b82f6" size={32} />
                            </div>
                            <div className={styles.roleText}>
                                <h3>Ground Owner</h3>
                                <p>Super Admin - See all locations & analytics</p>
                            </div>
                            <ChevronRight size={20} className={styles.chevron} />
                        </button>

                        <button
                            className={`${styles.roleCard} ${role === 'manager' ? styles.active : ''}`}
                            onClick={() => handleRoleSelect('manager')}
                        >
                            <div className={styles.roleIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                <Users color="#10b981" size={32} />
                            </div>
                            <div className={styles.roleText}>
                                <h3>Venue Manager</h3>
                                <p>Limited access to a specific ground</p>
                            </div>
                            <ChevronRight size={20} className={styles.chevron} />
                        </button>
                    </div>
                ) : (
                    <div className={styles.setupForm}>
                        {role === 'manager' && (
                            <div className={styles.formGroup}>
                                <label>Assigned Location</label>
                                <select
                                    value={selectedLoc}
                                    onChange={(e) => setSelectedLoc(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select Ground...</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Passcode (Default: 0000)</label>
                            <div className={styles.inputWithIcon}>
                                <Lock size={18} />
                                <input
                                    type="password"
                                    placeholder="Enter passcode"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.modalActions}>
                            <button className={styles.backBtn} onClick={() => setStep(1)}>Back</button>
                            <button className={styles.submitBtn} onClick={handleComplete}>
                                <CheckCircle size={18} />
                                Finish Setup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
