"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import AlertPopup, { AlertProps } from './components/AlertPopup';
import AnalyticsView from './components/AnalyticsView';
import CalendarView from './components/CalendarView';
import CustomerView from './components/CustomerView';
import FinancialView from './components/FinancialView';
import RoleSelector from './components/RoleSelector';
import { playAlertSound } from './utils/sound';
import { playCashRegisterSound } from './utils/audio';
import { getManagerForLocation } from './utils/managers';
import { LayoutDashboard, BarChart3, Calendar as CalendarDays, Settings, ShieldCheck, UserCircle, IndianRupee } from 'lucide-react';
import styles from './page.module.css';

interface AlertItem extends AlertProps {
    id: string;
    platform: 'Playo' | 'Hudle' | 'District' | 'Khelomore' | 'System';
    bookingSlot?: string;
    gameDate?: string;
    gameTime?: string;
    sport?: string;
    managerName?: string;
    bookingName?: string;
    paidAmount?: string;
}

export default function Home() {
    const [view, setView] = useState<'live' | 'analytics' | 'calendar' | 'customers' | 'financials'>('live');
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [bookingHistory, setBookingHistory] = useState<AlertItem[]>([]);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    const [isTest, setIsTest] = useState(false);

    // 🔐 Role-Based Access Control
    const [userRole, setUserRole] = useState<'owner' | 'manager' | null>(null);
    const [managerLocation, setManagerLocation] = useState<string>('All Locations');
    const [isRoleSet, setIsRoleSet] = useState(false);

    useEffect(() => {
        setIsTest(process.env.NODE_ENV === 'development');

        // Load Role Identity
        const savedRole = localStorage.getItem('alert_user_role') as 'owner' | 'manager';
        const savedLoc = localStorage.getItem('alert_manager_loc');
        if (savedRole) {
            setUserRole(savedRole);
            setManagerLocation(savedLoc || 'All Locations');
            setIsRoleSet(true);
            if (savedRole === 'manager' && savedLoc) {
                setSelectedLocation(savedLoc);
            }
        }
    }, []);

    const handleRoleSelect = (role: 'owner' | 'manager', location: string) => {
        setUserRole(role);
        setManagerLocation(location);
        setIsRoleSet(true);
        localStorage.setItem('alert_user_role', role);
        localStorage.setItem('alert_manager_loc', location);
        if (role === 'manager') {
            setSelectedLocation(location);
        }
    };

    const handleResetRole = () => {
        if (confirm("Reset account identity setup? You will need to re-enter your passcode.")) {
            localStorage.removeItem('alert_user_role');
            localStorage.removeItem('alert_manager_loc');
            window.location.reload();
        }
    };

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const loadHistory = async () => {
            try {
                const res = await fetch('/api/get-history', {
                    headers: { 'x-api-key': (process.env.NEXT_PUBLIC_API_SECRET || '').trim() }
                });
                const data = await res.json();
                if (data.success && data.history) {
                    const formatted = data.history.map((item: any) => ({
                        ...item,
                        timestamp: new Date(item.timestamp)
                    }));
                    setBookingHistory(formatted);
                }
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setIsHistoryLoaded(true);
            }
        };

        loadHistory();
    }, []);

    const sendNativeNotification = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body, icon: '/manifest.json' });
        }
    };

    const locations = [
        'Thane', 'Baner', 'Model Colony', 'Dahisar', 'Borivali', 'Andheri', 'Matoshree'
    ];

    const removeAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const [isLiveSync, setIsLiveSync] = useState(true);
    const [syncStatus, setSyncStatus] = useState('Initializing...');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [isPushSubmitting, setIsPushSubmitting] = useState(false);
    const [pushStatus, setPushStatus] = useState<'default' | 'enabled' | 'error'>('default');

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        setIsPushSubmitting(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });

            await fetch('/api/push-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': (process.env.NEXT_PUBLIC_API_SECRET || '').trim()
                },
                body: JSON.stringify({ subscription, location: selectedLocation })
            });

            setPushStatus('enabled');
            alert(`🔔 Success! Notifications enabled for ${selectedLocation}.`);
        } catch (e) {
            console.error('Push failed', e);
            setPushStatus('error');
        } finally {
            setIsPushSubmitting(false);
        }
    };

    const formatGameDate = (dateStr: string) => {
        if (!dateStr || dateStr === 'TBD' || dateStr === '-' || dateStr === 'MISSING') return "TBD";
        try {
            let cleanStr = dateStr.replace(/'(\d{2})/, '20$1');
            const date = new Date(cleanStr);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                if (year < 2025) date.setFullYear(2026);
                return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
        } catch (e) { }
        return dateStr;
    };

    const filteredHistory = [...bookingHistory].filter(item => {
        if (!userRole || userRole === 'owner') return true;
        return item.location === managerLocation;
    });
    const sortedHistory = [...filteredHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const isSyncingRef = useRef(false);
    const notifiedSessionIds = useRef<Set<string>>(new Set());

    const triggerAutoAlert = useCallback((
        platform: 'Playo' | 'Hudle' | 'District' | 'Khelomore' | 'System',
        location: string,
        msg: string,
        slot: string | undefined,
        sport: string | undefined,
        shouldPlaySound = true,
        timestamp?: Date,
        alertId: string = Math.random().toString(),
        gameDate: string = "",
        gameTime: string = "",
        bookingName: string = "N/A",
        paidAmount: string = "N/A"
    ) => {
        if (notifiedSessionIds.current.has(alertId)) return;
        if (bookingHistory.some(item => item.id === alertId)) return;

        const manager = getManagerForLocation(location);
        const isSystemBroadcast = location === 'Unknown Location' || location === 'System' || !location;

        const newAlert: AlertItem = {
            id: alertId, platform, message: msg,
            location: isSystemBroadcast ? 'System Update' : location,
            timestamp: timestamp || new Date(), onDismiss: removeAlert,
            bookingSlot: slot || (shouldPlaySound ? "Just Now" : "MISSING"),
            gameDate, gameTime, sport: sport || "General",
            managerName: isSystemBroadcast ? 'ALL MANAGERS' : manager.name,
            bookingName, paidAmount
        };

        notifiedSessionIds.current.add(alertId);

        if (shouldPlaySound) {
            setAlerts(prev => [newAlert, ...prev]);

            // Notification Chimes
            playAlertSound();
            setTimeout(() => playCashRegisterSound(), 800);
            setTimeout(() => playAlertSound(), 1600);

            const notificationTitle = isSystemBroadcast ? `📢 SYSTEM: ${platform} Update` : `Attention ${manager.name}: New ${platform} Booking!`;
            const notificationBody = isSystemBroadcast ? `Update: ${msg}` : `${sport || 'Booking'} at ${location}. Time: ${slot || 'Just Now'}`;
            sendNativeNotification(notificationTitle, notificationBody);
        }

        setBookingHistory(prev => {
            if (prev.some(item => item.id === alertId)) return prev;
            return [newAlert, ...prev];
        });
    }, [bookingHistory]);

    const checkEmails = useCallback(async (retries = 1, depth = '') => {
        if (!isLiveSync || isSyncingRef.current || !isHistoryLoaded || !isRoleSet) return;
        isSyncingRef.current = true;
        setSyncStatus(depth === 'all' ? 'Deep Scanning...' : 'Syncing...');

        try {
            const res = await fetch(`/api/check-emails${depth === 'all' ? '?depth=all' : ''}`, {
                headers: { 'x-api-key': (process.env.NEXT_PUBLIC_API_SECRET || '').trim() }
            });
            const data = await res.json();

            if (data.success) {
                if (data.alerts && data.alerts.length > 0) {
                    setSyncStatus(`Updated ${data.alerts.length} items`);
                    setBookingHistory(prev => {
                        const newHistory = [...prev];
                        data.alerts.forEach((a: any) => {
                            const idx = newHistory.findIndex(h => h.id === a.id);
                            const formatted = { ...a, timestamp: new Date(a.timestamp) };
                            if (idx === -1) newHistory.push(formatted);
                            else newHistory[idx] = formatted;
                        });
                        return newHistory;
                    });

                    data.alerts.forEach((a: any) => {
                        const alertDate = new Date(a.timestamp);
                        const isLive = (Date.now() - alertDate.getTime()) < 60 * 60 * 1000 && depth !== 'all';
                        const isRelevant = userRole === 'owner' || a.location === managerLocation;

                        if (isRelevant) {
                            triggerAutoAlert(a.platform, a.location, a.message, a.bookingSlot, a.sport, isLive, alertDate, a.id, a.gameDate, a.gameTime, a.bookingName, a.paidAmount);
                        }
                    });
                } else {
                    setSyncStatus(depth === 'all' ? 'Deep Sync Complete' : 'Sync Active');
                }
                setLastSyncTime(new Date());
            }
        } catch (error) {
            console.error("Sync error:", error);
        } finally {
            isSyncingRef.current = false;
        }
    }, [isLiveSync, isHistoryLoaded, isRoleSet, userRole, managerLocation, bookingHistory, triggerAutoAlert]);

    const handleDeepSync = () => {
        if (confirm("Scan entire inbox?")) checkEmails(1, 'all');
    };

    useEffect(() => {
        if (isHistoryLoaded && isRoleSet) checkEmails();
        const interval = setInterval(checkEmails, 60000);
        return () => clearInterval(interval);
    }, [isLiveSync, isHistoryLoaded, isRoleSet, checkEmails]);

    const handleClearHistory = async () => {
        if (!confirm("Clear history?")) return;
        try {
            const res = await fetch('/api/clear-history', {
                method: 'POST',
                headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_SECRET || '' }
            });
            if ((await res.json()).success) setBookingHistory([]);
        } catch (e) { }
    };

    // ... (previous code)

    const handleDeleteBooking = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this booking?")) return;

        try {
            const res = await fetch('/api/delete-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': (process.env.NEXT_PUBLIC_API_SECRET || '').trim()
                },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                setBookingHistory(prev => prev.filter(item => item.id !== id));
                // Also remove from local alerts if present
                setAlerts(prev => prev.filter(item => item.id !== id));
            } else {
                alert("Failed to delete: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting booking");
        }
    };

    return (
        <main className={styles.main}>
            {!isRoleSet && <RoleSelector onSelect={handleRoleSelect} locations={locations} />}

            <div className={styles.dashboard}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.title}>Turf Alert Dashboard</h1>

                    <div className={styles.userBadgeContainer as string || ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: isTest ? '#fef3c7' : '#dcfce7', color: isTest ? '#92400e' : '#166534',
                            border: `1px solid ${isTest ? '#f59e0b' : '#22c55e'}`, textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                        }}>
                            {isTest ? '🧪 Test Mode' : '🚀 Production'}
                        </span>

                        <div style={{
                            background: userRole === 'owner' ? '#eff6ff' : '#ecfdf5',
                            padding: '6px 14px', borderRadius: '12px', border: `1px solid ${userRole === 'owner' ? '#3b82f6' : '#10b981'}`,
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            {userRole === 'owner' ? <ShieldCheck size={16} color="#3b82f6" /> : <UserCircle size={16} color="#10b981" />}
                            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: userRole === 'owner' ? '#1e40af' : '#065f46' }}>
                                {userRole === 'owner' ? 'OWNER' : userRole ? 'MANAGER' : 'GUEST'}
                            </span>
                        </div>
                        <button onClick={handleResetRole} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px' }}>
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* 📊 TAB NAVIGATION */}
                <div className={styles.tabNav}>
                    <button className={`${styles.tabBtn} ${view === 'live' ? styles.active : ''}`} onClick={() => setView('live')}>
                        <LayoutDashboard size={18} /> Live Feed
                    </button>
                    <button className={`${styles.tabBtn} ${view === 'analytics' ? styles.active : ''}`} onClick={() => setView('analytics')}>
                        <BarChart3 size={18} /> Analytics
                    </button>
                    <button className={`${styles.tabBtn} ${view === 'calendar' ? styles.active : ''}`} onClick={() => setView('calendar')}>
                        <CalendarDays size={18} /> Calendar
                    </button>
                    <button className={`${styles.tabBtn} ${view === 'customers' ? styles.active : ''}`} onClick={() => setView('customers')}>
                        <UserCircle size={18} /> Customers
                    </button>
                    <button className={`${styles.tabBtn} ${view === 'financials' ? styles.active : ''}`} onClick={() => setView('financials')}>
                        <IndianRupee size={18} /> Financials
                    </button>
                </div>

                {view === 'live' ? (
                    <>
                        <div className={styles.divider}>
                            <div className={styles.historyHeader} style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>📜 Booking History</span>
                                <div className={styles.historyControls} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', color: '#64748b', fontWeight: 'bold' }}>
                                        Records: {sortedHistory.length}
                                    </span>
                                    <button onClick={handleDeepSync} style={{ fontSize: '0.7rem', background: '#334155', color: 'white', padding: '6px 12px', borderRadius: '8px' }}>🚀 Sync All</button>
                                </div>
                            </div>
                        </div>

                        {/* 📱 MOBILE VIEW: CARDS */}
                        <div className={styles.cardContainer}>
                            {sortedHistory.map((item: any) => (
                                <div key={item.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.platformBadge} style={{
                                            background: item.platform === 'Playo' ? '#E8F5E9' :
                                                item.platform === 'Hudle' ? '#E1F5FE' :
                                                    item.platform === 'Khelomore' ? '#FBE9E7' :
                                                        item.platform === 'System' ? '#F3E5F5' : '#ECEFF1',
                                            color: item.platform === 'Playo' ? '#2E7D32' :
                                                item.platform === 'Hudle' ? '#0277BD' :
                                                    item.platform === 'Khelomore' ? '#D84315' :
                                                        item.platform === 'System' ? '#6A1B9A' : '#37474F'
                                        }}>
                                            {item.platform}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className={styles.receivedTime}>
                                                {item.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                {Date.now() - item.timestamp.getTime() < 120000 && (
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        background: '#4ade80',
                                                        color: '#fff',
                                                        padding: '1px 5px',
                                                        borderRadius: '10px',
                                                        animation: 'pulse 1.5s infinite',
                                                        fontWeight: 'bold',
                                                        marginLeft: '5px'
                                                    }}>NEW</span>
                                                )}
                                            </div>
                                            {userRole === 'owner' && (
                                                <button
                                                    onClick={(e) => handleDeleteBooking(item.id, e)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#ef4444' }}
                                                    title="Delete Booking"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardRow}>
                                            <span className={styles.cardLabel}>Location:</span>
                                            <span className={styles.cardValue}>{item.location}</span>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <span className={styles.cardLabel}>Sport:</span>
                                            <span className={styles.cardValue}>{item.sport || 'General'}</span>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <span className={styles.cardLabel}>Date:</span>
                                            <span className={styles.cardValue}>{formatGameDate(item.gameDate)}</span>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <span className={styles.cardLabel}>Time:</span>
                                            <span className={styles.cardValue}>{item.gameTime || item.bookingSlot || '-'}</span>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <span className={styles.cardLabel}>Customer:</span>
                                            <span className={styles.cardValue}>{item.bookingName || 'N/A'}</span>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <span className={styles.cardLabel}>Manager:</span>
                                            <span className={styles.cardValue}>{getManagerForLocation(item.location).name}</span>
                                        </div>
                                        <div className={styles.cardBottomRow}>
                                            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                                                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <span style={{
                                                fontSize: '1rem',
                                                color: item.paidAmount !== 'N/A' ? '#15803d' : '#64748b',
                                                background: item.paidAmount !== 'N/A' ? '#dcfce7' : '#f1f5f9',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontWeight: '800'
                                            }}>
                                                {item.paidAmount || 'N/A'}
                                            </span>
                                        </div>
                                        {item.message && (
                                            <div style={{
                                                marginTop: '8px',
                                                paddingTop: '8px',
                                                borderTop: '1px solid #f1f5f9',
                                                fontSize: '0.75rem',
                                                color: '#94a3b8',
                                                fontStyle: 'italic'
                                            }}>
                                                {item.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP VIEW: TABLE */}
                        <div className={styles.tableContainer}>
                            <table className={`${styles.bookingTable} ${styles.desktopOnly}`}>
                                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                                    <tr>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Received</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Game Date</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Time</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Platform</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Sport</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Customer</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Amount</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Location</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Details</th>
                                        <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Manager</th>
                                        {userRole === 'owner' && <th style={{ padding: '15px 10px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedHistory.map((item: any) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 10px' }} title={item.timestamp.toLocaleString()}>
                                                <div className={styles.receivedTime} style={{ fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {item.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    {Date.now() - item.timestamp.getTime() < 120000 && (
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            background: '#4ade80',
                                                            color: '#fff',
                                                            padding: '1px 5px',
                                                            borderRadius: '10px',
                                                            animation: 'pulse 1.5s infinite',
                                                            fontWeight: 'bold'
                                                        }}>NEW</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div style={{ fontWeight: '700', color: '#0369a1' }}>
                                                    {formatGameDate(item.gameDate)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div className={styles.gameTime}>{item.gameTime || item.bookingSlot || '-'}</div>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span
                                                    className={styles.platformTag}
                                                    style={{
                                                        background: item.platform === 'Playo' ? '#E8F5E9' :
                                                            item.platform === 'Hudle' ? '#E1F5FE' :
                                                                item.platform === 'Khelomore' ? '#FBE9E7' :
                                                                    item.platform === 'System' ? '#F3E5F5' : '#ECEFF1',
                                                        color: item.platform === 'Playo' ? '#2E7D32' :
                                                            item.platform === 'Hudle' ? '#0277BD' :
                                                                item.platform === 'Khelomore' ? '#D84315' :
                                                                    item.platform === 'System' ? '#6A1B9A' : '#37474F'
                                                    }}
                                                >
                                                    {item.platform}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span
                                                    className={styles.sportBadge}
                                                    style={{
                                                        background: item.sport === 'Badminton' ? '#FFF3E0' : item.sport === 'Cricket' ? '#F3E5F5' : '#F5F5F5',
                                                        color: item.sport === 'Badminton' ? '#E65100' : item.sport === 'Cricket' ? '#7B1FA2' : '#616161'
                                                    }}
                                                >
                                                    {item.sport || 'General'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>
                                                    {item.bookingName || 'N/A'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: item.paidAmount !== 'N/A' ? '#15803d' : '#64748b',
                                                    background: item.paidAmount !== 'N/A' ? '#dcfce7' : '#f1f5f9',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    fontWeight: '700',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.paidAmount || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div className={styles.locationText}>{item.location}</div>
                                            </td>
                                            <td style={{ padding: '12px 10px', maxWidth: '200px' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.message}>
                                                    {item.message || '-'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: '#0d47a1',
                                                    background: '#e3f2fd',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: '600'
                                                }}>
                                                    {getManagerForLocation(item.location).name}
                                                </span>
                                            </td>
                                            {userRole === 'owner' && (
                                                <td style={{ padding: '12px 10px' }}>
                                                    <button
                                                        onClick={(e) => handleDeleteBooking(item.id, e)}
                                                        style={{
                                                            background: '#fee2e2',
                                                            border: '1px solid #fca5a5',
                                                            color: '#b91c1c',
                                                            borderRadius: '6px',
                                                            padding: '4px 8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : view === 'analytics' ? (
                    <AnalyticsView data={filteredHistory as any} />
                ) : view === 'customers' ? (
                    <CustomerView bookings={filteredHistory as any} />
                ) : view === 'financials' ? (
                    <FinancialView bookings={filteredHistory as any} />
                ) : (
                    <CalendarView bookings={filteredHistory as any} />
                )}

                <div className={styles.info}>
                    <p>Simulating user on Mobile (Turf Manager)</p>
                    <p><strong>Sound Active:</strong> Alerts will play a chime + cash register sound.</p>
                </div>
            </div>

            <div className={styles.alertContainer}>
                {alerts.map((alert, index) => (
                    <div key={alert.id} style={{ marginTop: index * 10 }}>
                        <AlertPopup {...alert} />
                    </div>
                ))}
            </div>
        </main >
    );
}
