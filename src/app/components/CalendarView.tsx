'use client';

import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Clock, User, Tag, MapPin, AlertCircle, Zap } from 'lucide-react';
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';

interface Booking {
    id: string;
    platform: string;
    location: string;
    bookingSlot: string;
    gameDate: string;
    gameTime: string;
    sport: string;
    bookingName: string;
    paidAmount: string;
    timestamp: string;
}

interface CalendarViewProps {
    bookings: Booking[];
}

export default function CalendarView({ bookings }: CalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Group bookings by date for easy lookup
    const bookingsByDate = useMemo(() => {
        const groups: Record<string, Booking[]> = {};
        bookings.forEach((b) => {
            if (!b.gameDate || b.gameDate === 'TBD' || b.gameDate === 'MISSING') return;
            try {
                let dateKey = '';
                // Handle "09 Feb '25" or similar formats
                let cleanDateStr = b.gameDate.replace(/'(\d{2})/, '20$1');
                const date = new Date(cleanDateStr);

                if (!isNaN(date.getTime())) {
                    // Force year to 2026 if it looks like 2025 (testing logic from page.tsx)
                    if (date.getFullYear() < 2025) date.setFullYear(2026);
                    dateKey = startOfDay(date).toISOString();
                } else {
                    console.warn(`Invalid date format for booking ${b.id}: ${b.gameDate}`);
                    return;
                }

                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(b);
            } catch (e) {
                console.error("Error parsing date:", e);
            }
        });
        return groups;
    }, [bookings]);

    const selectedBookings = useMemo(() => {
        const key = startOfDay(selectedDate).toISOString();
        return (bookingsByDate[key] || []);
    }, [selectedDate, bookingsByDate]);

    // Helper to parse time string "08:00 PM" into minutes from midnight
    const timeToMinutes = (timeStr: string) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let [_, hours, mins, ent] = match;
        let h = parseInt(hours);
        if (ent.toUpperCase() === 'PM' && h < 12) h += 12;
        if (ent.toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + parseInt(mins);
    };

    // Grouping & Sorting logic
    const selectedBookingsWithTimes = useMemo(() => {
        return selectedBookings.map(b => {
            const times = b.gameTime.split('-').map(t => t.trim());
            return {
                ...b,
                startMinutes: timeToMinutes(times[0]),
                endMinutes: times[1] ? timeToMinutes(times[1]) : timeToMinutes(times[0]) + 60
            };
        }).sort((a, b) => a.startMinutes - b.startMinutes);
    }, [selectedBookings]);

    // Gap detection (Available slots)
    const gaps = useMemo(() => {
        if (selectedBookingsWithTimes.length < 2) return {};
        const detectedGaps: Record<string, { start: string; end: string; duration: number }> = {};

        for (let i = 0; i < selectedBookingsWithTimes.length - 1; i++) {
            const currentEnd = selectedBookingsWithTimes[i].endMinutes;
            const nextStart = selectedBookingsWithTimes[i + 1].startMinutes;

            if (nextStart > currentEnd) {
                detectedGaps[selectedBookingsWithTimes[i].id] = {
                    start: selectedBookingsWithTimes[i].gameTime.split('-')[1]?.trim() || '...',
                    end: selectedBookingsWithTimes[i + 1].gameTime.split('-')[0]?.trim() || '...',
                    duration: nextStart - currentEnd
                };
            }
        }
        return detectedGaps;
    }, [selectedBookingsWithTimes]);

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const key = startOfDay(date).toISOString();
            const count = bookingsByDate[key]?.length || 0;
            if (count > 0) {
                return (
                    <div className="flex justify-center mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
            {/* Left: Calendar Control */}
            <div className="w-full lg:w-fit animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="border border-slate-200 bg-white shadow-xl rounded-2xl p-4">
                    <Calendar
                        onChange={(val) => setSelectedDate(val as Date)}
                        value={selectedDate}
                        tileContent={tileContent}
                        className="bg-transparent border-none text-slate-700"
                    />
                </div>

                {/* Legend/Status */}
                <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Select a date to view the booking timeline and identify empty slots.</p>
                </div>
            </div>

            {/* Right: Timeline View */}
            <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        {format(selectedDate, 'do MMMM, yyyy')}
                    </h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                        {selectedBookings.length} Bookings
                    </span>
                </div>

                {selectedBookingsWithTimes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 italic">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        No bookings found for this day.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedBookingsWithTimes.map((booking, idx) => (
                            <React.Fragment key={booking.id}>
                                <div className="border border-slate-100 bg-white hover:shadow-md transition-all border-l-4 border-l-indigo-500 rounded-xl overflow-hidden shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-800 leading-tight">
                                                {booking.gameTime}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold uppercase tracking-wider">
                                                    {booking.platform}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {booking.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700 flex items-center justify-end gap-1">
                                                <User className="w-4 h-4 text-slate-400" /> {booking.bookingName}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">{booking.sport}</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm border border-emerald-100 min-w-[80px] text-center">
                                            {booking.paidAmount}
                                        </div>
                                    </div>
                                </div>

                                {/* Gap Indicator Rendering */}
                                {gaps[booking.id] && (
                                    <div className="py-2 pl-4 border-l-2 border-dashed border-slate-300 ml-8 transition-all hover:border-amber-500/50 group">
                                        <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 w-fit animate-pulse group-hover:bg-amber-500/10">
                                            <div className="p-1.5 bg-amber-500/20 rounded-lg">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none">
                                                    Slot Available
                                                </p>
                                                <p className="text-sm font-medium text-slate-600 mt-1">
                                                    {gaps[booking.id].start} - {gaps[booking.id].end} ({Math.round(gaps[booking.id].duration)} mins)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* Inline CSS for react-calendar styling */}
            <style jsx global>{`
                .react-calendar {
                    border: none !important;
                    background: transparent !important;
                    font-family: inherit !important;
                    width: 320px !important;
                }
                .react-calendar__navigation button {
                    color: #1e293b !important;
                    min-width: 44px;
                    background: none;
                    font-size: 16px;
                    margin-top: 8px;
                    font-weight: 700;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: #f1f5f9 !important;
                    border-radius: 8px;
                }
                .react-calendar__month-view__weekdays {
                    color: #64748b !important;
                    text-transform: uppercase;
                    font-weight: bold;
                    font-size: 11px;
                }
                .react-calendar__tile {
                    padding: 0.75em 0.5em !important;
                    border-radius: 8px !important;
                    color: #334155 !important;
                    font-weight: 600;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background-color: #f1f5f9 !important;
                    color: #0f172a !important;
                }
                .react-calendar__tile--now {
                    background: #eff6ff !important;
                    color: #3b82f6 !important;
                    font-weight: bold;
                }
                .react-calendar__tile--active {
                    background: #3b82f6 !important;
                    color: white !important;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    opacity: 0.4;
                }
            `}</style>
        </div>
    );
}
