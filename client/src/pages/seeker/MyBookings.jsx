import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { EmptyState, Spinner } from '../../components/ui/index.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { RiVideoLine, RiCalendar2Line } from 'react-icons/ri';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const { data } = await api.get(`/appointments${params}`);
            setBookings(data.data?.appointments || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filter]);

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1 className="page-title">My Bookings</h1><p className="page-subtitle">Track your referral appointment requests</p></div>
            <div className="filter-bar" style={{ marginBottom: 20 }}>
                {['all', 'pending', 'confirmed', 'completed', 'referred', 'rejected', 'cancelled'].map((s) => (
                    <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
                ))}
            </div>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
                : bookings.length === 0 ? <EmptyState icon="📅" title="No bookings yet" message="Browse referrals and book your first appointment!" action={<a href="/seeker/browse" className="btn btn-primary">Browse Referrals</a>} />
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {bookings.map((b) => (
                            <div key={b._id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <AppointmentCard appointment={b} />

                                {/* Google Meet join button — shown when confirmed + link exists */}
                                {b.meetLink && b.status === 'confirmed' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,217,255,0.07))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 'var(--radius-md)', marginTop: -4 }}>
                                        <RiCalendar2Line style={{ color: 'var(--color-primary)', fontSize: 18, flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 700, fontSize: 13 }}>Your session is confirmed! 🎉</p>
                                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>A Google Calendar invite has been sent to your email.</p>
                                        </div>
                                        <a
                                            href={b.meetLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-primary btn-sm"
                                            style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                                        >
                                            <RiVideoLine /> Join Google Meet
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
            }
        </div>
    );
}
