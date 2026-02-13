"use client";

import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
    TrendingUp, Users, DollarSign, Activity,
    Calendar as CalendarIcon, MapPin
} from 'lucide-react';
import styles from '../page.module.css';

interface Booking {
    id: string;
    platform: string;
    location: string;
    gameDate: string;
    gameTime: string;
    sport: string;
    paidAmount: string;
    timestamp: Date | string;
}

interface AnalyticsViewProps {
    data: Booking[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsView({ data }: AnalyticsViewProps) {
    // 1. Process Data for Charts
    const stats = useMemo(() => {
        const revenueByDate: Record<string, number> = {};
        const revenueBySport: Record<string, number> = {};
        const revenueByLocation: Record<string, number> = {};
        const bookingsByHour: Record<number, number> = {};
        const bookingsByPlatform: Record<string, number> = {};
        const revenueByPlatform: Record<string, number> = {};
        let totalRevenue = 0;
        let todayRevenue = 0;
        const now = new Date();
        const todayStr = now.toLocaleDateString();

        data.forEach(booking => {
            const amount = parseInt(booking.paidAmount?.replace(/[^0-9]/g, '') || '0');
            totalRevenue += amount;

            // Revenue by Date
            const date = new Date(booking.timestamp);
            const dateKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + amount;

            if (date.toLocaleDateString() === todayStr) {
                todayRevenue += amount;
            }

            // Revenue by Sport
            const sport = booking.sport || 'General';
            revenueBySport[sport] = (revenueBySport[sport] || 0) + amount;

            // Revenue by Location
            const loc = booking.location || 'Unknown';
            revenueByLocation[loc] = (revenueByLocation[loc] || 0) + amount;

            // Bookings by Hour
            if (booking.gameTime && booking.gameTime !== 'MISSING') {
                const hourMatch = booking.gameTime.match(/(\d+):/);
                if (hourMatch) {
                    let hour = parseInt(hourMatch[1]);
                    const isPM = booking.gameTime.toLowerCase().includes('pm');
                    if (isPM && hour !== 12) hour += 12;
                    if (!isPM && hour === 12) hour = 0;
                    bookingsByHour[hour] = (bookingsByHour[hour] || 0) + 1;
                }
            }

            // Bookings by Platform
            const platform = booking.platform || 'Unknown';
            bookingsByPlatform[platform] = (bookingsByPlatform[platform] || 0) + 1;
            revenueByPlatform[platform] = (revenueByPlatform[platform] || 0) + amount;
        });

        // Format for Recharts - Ensure chronological last 30 days
        const revenueData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            revenueData.push({
                date: dateKey,
                amount: revenueByDate[dateKey] || 0
            });
        }

        const sportData = Object.entries(revenueBySport)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort highest first

        const locationData = Object.entries(revenueByLocation)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);

        const hourData = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            count: bookingsByHour[i] || 0
        })).filter(h => h.count > 0 || (parseInt(h.hour) >= 6 && parseInt(h.hour) <= 23));

        const platformData = Object.entries(bookingsByPlatform)
            .map(([name, count]) => ({
                name,
                count,
                revenue: revenueByPlatform[name] || 0
            }))
            .sort((a, b) => b.count - a.count);

        return {
            totalRevenue,
            todayRevenue,
            revenueData,
            sportData,
            locationData,
            hourData,
            platformData,
            bookingCount: data.length
        };
    }, [data]);

    return (
        <div className={styles.analyticsContainer}>
            {/* Header / Summary Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(0, 136, 254, 0.1)' }}>
                        <DollarSign color="#0088FE" size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Revenue</span>
                        <h2 className={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</h2>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(0, 196, 159, 0.1)' }}>
                        <TrendingUp color="#00C49F" size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Today&apos;s Revenue</span>
                        <h2 className={styles.statValue}>₹{stats.todayRevenue.toLocaleString()}</h2>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255, 187, 40, 0.1)' }}>
                        <Activity color="#FFBB28" size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Bookings</span>
                        <h2 className={styles.statValue}>{stats.bookingCount}</h2>
                    </div>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                {/* Revenue Trend */}
                <div className={`${styles.chartCard} ${styles.wide}`}>
                    <div className={styles.chartHeader}>
                        <TrendingUp size={18} />
                        <h3>Revenue Trend (Last 30 Days)</h3>
                    </div>
                    <div className={styles.chartBox}>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={stats.revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#0088FE' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#0088FE" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sport Popularity */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <Activity size={18} />
                        <h3>Sport Popularity</h3>
                    </div>
                    <div className={styles.chartBox}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={stats.sportData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.sportData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bookings by Platform */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <Users size={18} />
                        <h3>Bookings by Platform</h3>
                    </div>
                    <div className={styles.chartBox}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={stats.platformData}>
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                    formatter={(value: any, name?: string) => {
                                        if (name === 'count') return [value, 'Bookings'];
                                        if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                                        return [value, name || ''];
                                    }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Peak Time Analysis */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <CalendarIcon size={18} />
                        <h3>Peak Hour Analysis</h3>
                    </div>
                    <div className={styles.chartBox}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={stats.hourData}>
                                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Location Performance */}
                <div className={`${styles.chartCard} ${styles.wide}`}>
                    <div className={styles.chartHeader}>
                        <MapPin size={18} />
                        <h3>Location Performance</h3>
                    </div>
                    <div className={styles.chartBox}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.locationData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.6)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="amount" fill="#00C49F" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
