import React, { useState, useMemo } from 'react';
import { User, Trophy, Star, History, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Booking {
    id: string;
    bookingName: string;
    paidAmount: string; // e.g. "₹618" or "N/A"
    sport: string;
    timestamp: Date;
    platform: string;
    location: string;
    gameDate?: string;
    gameTime?: string;
}

interface CustomerProfile {
    name: string;
    totalSpend: number;
    bookingCount: number;
    lastVisit: Date;
    bookings: Booking[];
    tier: 'VIP' | 'Regular' | 'New';
    favoriteSport: string;
}

interface CustomerViewProps {
    bookings: Booking[];
}

const CustomerView: React.FC<CustomerViewProps> = ({ bookings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof CustomerProfile; direction: 'asc' | 'desc' } | null>({ key: 'totalSpend', direction: 'desc' });
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

    // 1. Agreggate Data
    const customers = useMemo(() => {
        const customerMap = new Map<string, CustomerProfile>();

        bookings.forEach(b => {
            const name = b.bookingName?.trim() || 'Unknown';
            if (name === 'N/A' || name === 'Unknown' || name === 'Customer') return; // Skip invalid names

            // Normalize name (simple case-insensitive)
            const normalizedName = name.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            if (!customerMap.has(normalizedName)) {
                customerMap.set(normalizedName, {
                    name: normalizedName,
                    totalSpend: 0,
                    bookingCount: 0,
                    lastVisit: new Date(0),
                    bookings: [],
                    tier: 'New',
                    favoriteSport: 'General'
                });
            }

            const profile = customerMap.get(normalizedName)!;
            profile.bookings.push(b);
            profile.bookingCount += 1;

            // Clean amount string
            const amountStr = b.paidAmount.replace(/[^\d.]/g, '');
            const amount = parseFloat(amountStr) || 0;
            profile.totalSpend += amount;

            if (b.timestamp > profile.lastVisit) {
                profile.lastVisit = b.timestamp;
            }
        });

        // Calculate Tier & Stats
        const profileList = Array.from(customerMap.values()).map(p => {
            // Determine Favorite Sport
            const sportCounts: Record<string, number> = {};
            p.bookings.forEach(b => {
                const s = b.sport || 'General';
                sportCounts[s] = (sportCounts[s] || 0) + 1;
            });
            p.favoriteSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0][0];

            // Tier Logic
            if (p.totalSpend > 5000 || p.bookingCount > 10) p.tier = 'VIP';
            else if (p.bookingCount > 2) p.tier = 'Regular';
            else p.tier = 'New';

            return p;
        });

        return profileList;
    }, [bookings]);

    // 2. Filter & Sort
    const filteredCustomers = useMemo(() => {
        let sorted = [...customers];

        if (searchTerm) {
            sorted = sorted.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (sortConfig) {
            sorted.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return sorted;
    }, [customers, searchTerm, sortConfig]);

    const requestSort = (key: keyof CustomerProfile) => {
        let direction: 'asc' | 'desc' = 'desc'; // Default desc for numbers usually
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof CustomerProfile) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} color="#94a3b8" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#3b82f6" /> : <ArrowDown size={14} color="#3b82f6" />;
    };

    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '600px' }}>
            {selectedCustomer ? (
                // DETAIL VIEW
                <div className="animate-fade-in">
                    <button onClick={() => setSelectedCustomer(null)} style={{ marginBottom: '15px', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ← Back to List
                    </button>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={30} color="#3b82f6" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{selectedCustomer.name}</h2>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: selectedCustomer.tier === 'VIP' ? '#fef3c7' : '#f1f5f9', color: selectedCustomer.tier === 'VIP' ? '#d97706' : '#64748b', fontWeight: 'bold' }}>
                                    {selectedCustomer.tier}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Since {selectedCustomer.bookings[selectedCustomer.bookings.length - 1].timestamp.toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Lifetime Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>₹{selectedCustomer.totalSpend.toLocaleString()}</div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <History size={18} /> Booking History
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Platform</th>
                                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Sport</th>
                                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCustomer.bookings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((b, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px', fontSize: '0.9rem', color: '#334155' }}>
                                            {b.gameDate || b.timestamp.toLocaleDateString()} <br />
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.gameTime}</span>
                                        </td>
                                        <td style={{ padding: '10px', fontSize: '0.9rem', color: '#334155' }}>{b.platform}</td>
                                        <td style={{ padding: '10px', fontSize: '0.9rem', color: '#334155' }}>{b.sport}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>{b.paidAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // LIST VIEW
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Customer Insights</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Track your top spenders and loyal players</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '8px 10px 8px 35px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    width: '250px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', textAlign: 'left', padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>CUSTOMER {getSortIcon('name')}</div>
                                    </th>
                                    <th onClick={() => requestSort('tier')} style={{ cursor: 'pointer', textAlign: 'left', padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>STATUS {getSortIcon('tier')}</div>
                                    </th>
                                    <th onClick={() => requestSort('bookingCount')} style={{ cursor: 'pointer', textAlign: 'left', padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>BOOKINGS {getSortIcon('bookingCount')}</div>
                                    </th>
                                    <th onClick={() => requestSort('totalSpend')} style={{ cursor: 'pointer', textAlign: 'left', padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>TOTAL SPEND {getSortIcon('totalSpend')}</div>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#334155' }}>{customer.name}</span>
                                            {idx < 3 && sortConfig?.key === 'totalSpend' && sortConfig.direction === 'desc' && (
                                                <Trophy size={14} color="#eab308" fill="#eab308" />
                                            )}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                background: customer.tier === 'VIP' ? '#fef3c7' : customer.tier === 'Regular' ? '#dcfce7' : '#f1f5f9',
                                                color: customer.tier === 'VIP' ? '#d97706' : customer.tier === 'Regular' ? '#166534' : '#64748b',
                                                fontWeight: 'bold',
                                                display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content'
                                            }}>
                                                {customer.tier === 'VIP' && <Star size={10} fill="currentColor" />}
                                                {customer.tier}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', color: '#64748b' }}>
                                            {customer.bookingCount} <span style={{ fontSize: '0.8rem' }}>({customer.favoriteSport})</span>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>
                                            ₹{customer.totalSpend.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCustomers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                No customers found matching &quot;{searchTerm}&quot;
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerView;
