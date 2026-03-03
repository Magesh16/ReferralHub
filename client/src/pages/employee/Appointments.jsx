import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/index.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { formatDate } from '../../utils/formatters';

export default function EmployeeAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const { data } = await api.get(`/appointments${params}`);
            setAppointments(data.data?.appointments || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            load();
            toast.success(`Appointment ${status}`);
        } catch { toast.error('Update failed'); }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1 className="page-title">Appointments</h1><p className="page-subtitle">Review and manage seeker bookings</p></div>
            <div className="filter-bar" style={{ marginBottom: 20 }}>
                {['all', 'pending', 'confirmed', 'completed', 'referred', 'rejected'].map((s) => (
                    <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
                ))}
            </div>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
                : appointments.length === 0 ? <EmptyState icon="📅" title="No appointments" message="Bookings for your referral posts will appear here." />
                    : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {appointments.map((a) => (
                                <div key={a._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <AppointmentCard appointment={a} />
                                    {a.resumeUrl && (
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <a href={`http://localhost:8080${a.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📎 View Resume</a>
                                        </div>
                                    )}
                                    {a.coverNote && <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{a.coverNote}"</p>}
                                    {a.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'confirmed')}>✅ Confirm</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a._id, 'rejected')}>❌ Reject</button>
                                        </div>
                                    )}
                                    {a.status === 'confirmed' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'referred')}>✅ Mark as Referred</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(a._id, 'completed')}>Mark Completed</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
        </div>
    );
}
