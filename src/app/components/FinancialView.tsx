import React, { useState, useMemo } from 'react';
import { IndianRupee, PieChart, Wallet, CheckCircle2, Calculator, ArrowRight } from 'lucide-react';

interface Booking {
    id: string;
    bookingName: string;
    paidAmount: string;
    timestamp: Date;
    platform: string;
    location: string;
}

interface FinancialViewProps {
    bookings: Booking[];
}

const FinancialView: React.FC<FinancialViewProps> = ({ bookings }) => {
    const [platformCommissionRate, setPlatformCommissionRate] = useState(10); // Default 10%
    const [gstRate, setGstRate] = useState(18); // Default 18% on Commission

    // 1. Calculate Finances
    const financialData = useMemo(() => {
        let totalRevenue = 0;
        let platformBreakdown: Record<string, number> = {};
        let platformBookingCount: Record<string, number> = {};

        bookings.forEach(b => {
            const amountStr = (b.paidAmount || '0').replace(/[^\d.]/g, '');
            const amount = parseFloat(amountStr) || 0;

            if (amount > 0) {
                totalRevenue += amount;
                platformBreakdown[b.platform] = (platformBreakdown[b.platform] || 0) + amount;
                platformBookingCount[b.platform] = (platformBookingCount[b.platform] || 0) + 1;
            }
        });

        const platformFees = (totalRevenue * platformCommissionRate) / 100;
        const gstOnFee = (platformFees * gstRate) / 100;
        const totalDeductions = platformFees + gstOnFee;
        const netProfit = totalRevenue - totalDeductions;

        return {
            totalRevenue,
            platformFees,
            gstOnFee,
            totalDeductions,
            netProfit,
            platformBreakdown,
            platformBookingCount
        };
    }, [bookings, platformCommissionRate, gstRate]);

    const formatCurrency = (amount: number) => {
        return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 💰 KEY METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div className="card-hover" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#64748b' }}>
                        <Wallet size={20} /> Total Booking Value
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>
                        {formatCurrency(financialData.totalRevenue)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>
                        Gross Revenue before deductions
                    </div>
                </div>

                <div className="card-hover" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#64748b' }}>
                        <Calculator size={20} /> Deductions (Est.)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>
                        - {formatCurrency(financialData.totalDeductions)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>
                        {platformCommissionRate}% Comm + {gstRate}% GST
                    </div>
                </div>

                <div className="card-hover" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', opacity: 0.9 }}>
                        <CheckCircle2 size={20} /> Net Profit
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>
                        {formatCurrency(financialData.netProfit)}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '5px', opacity: 0.8 }}>
                        Expected Settlement Amount
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {/* 🧮 CALCULATOR SETTINGS */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={20} color="#3b82f6" /> Settlement Calculator
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Avg. Platform Commission (%)</label>
                            <input
                                type="range" min="0" max="30" step="0.5"
                                value={platformCommissionRate}
                                onChange={(e) => setPlatformCommissionRate(parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', height: '6px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>0%</span>
                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{platformCommissionRate}%</span>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>30%</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>GST on Service (%)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[0, 5, 12, 18].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => setGstRate(rate)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: gstRate === rate ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                            background: gstRate === rate ? '#eff6ff' : 'white',
                                            color: gstRate === rate ? '#1d4ed8' : '#64748b',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {rate}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '25px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Gross Amount:</span>
                            <span style={{ fontWeight: '600' }}>{formatCurrency(financialData.totalRevenue)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ef4444' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Platform Fee <span style={{ fontSize: '0.7em', padding: '2px 4px', background: '#fee2e2', borderRadius: '4px' }}>{platformCommissionRate}%</span>:</span>
                            <span>- {formatCurrency(financialData.platformFees)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#ef4444' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>GST <span style={{ fontSize: '0.7em', padding: '2px 4px', background: '#fee2e2', borderRadius: '4px' }}>18%</span>:</span>
                            <span>- {formatCurrency(financialData.gstOnFee)}</span>
                        </div>
                        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Reconciled Payout:</span>
                            <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.2rem' }}>{formatCurrency(financialData.netProfit)}</span>
                        </div>
                    </div>
                </div>

                {/* 📊 PLATFORM BREAKDOWN */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PieChart size={20} color="#8b5cf6" /> Bookings & Revenue by Platform
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {Object.entries(financialData.platformBreakdown).sort((a, b) => b[1] - a[1]).map(([platform, amount], idx) => {
                            const bookingCount = financialData.platformBookingCount[platform] || 0;
                            const avgBookingValue = bookingCount > 0 ? amount / bookingCount : 0;
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                                        {platform[0]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#334155' }}>{platform}</span>
                                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b', fontWeight: '600' }}>
                                                    {bookingCount} booking{bookingCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <span style={{ fontWeight: 'bold' }}>{formatCurrency(amount)}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px' }}>
                                            Avg: {formatCurrency(avgBookingValue)} per booking
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(amount / financialData.totalRevenue) * 100}%`, height: '100%', background: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#64748b', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialView;
