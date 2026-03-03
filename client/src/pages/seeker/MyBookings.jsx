import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { EmptyState, Spinner } from '../../components/ui/index.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';

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
                        {bookings.map((b) => <AppointmentCard key={b._id} appointment={b} />)}
                    </div>
            }
        </div>
    );
}
