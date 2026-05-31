import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { RiCalendar2Line, RiVideoLine } from 'react-icons/ri';

export default function EmployeeAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updating, setUpdating] = useState(null);

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
        setUpdating(id);
        try {
            const { data } = await api.patch(`/appointments/${id}/status`, { status });
            const updated = data.data;
            if (status === 'confirmed') {
                if (updated?.meetLink) {
                    toast.success('✅ Confirmed! Google Meet link created & invite sent 🗓️', { duration: 5000 });
                } else {
                    toast.success('✅ Appointment confirmed! (Connect Google Calendar in Profile to auto-create Meet links)');
                }
            } else {
                toast.success(`Appointment ${status}`);
            }
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setUpdating(null); }
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

                                    {/* Google Meet link */}
                                    {a.meetLink && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 'var(--radius-md)' }}>
                                            <RiCalendar2Line style={{ color: 'var(--color-success)', fontSize: 18, flexShrink: 0 }} />
                                            <p style={{ fontSize: 13, flex: 1 }}>
                                                <span style={{ fontWeight: 600 }}>Google Meet scheduled</span>
                                                <span style={{ color: 'var(--text-secondary)', marginLeft: 6, fontSize: 12 }}>Invite sent to both participants</span>
                                            </p>
                                            <a href={a.meetLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                                <RiVideoLine /> Join Meet
                                            </a>
                                        </div>
                                    )}

                                    {/* Resume & cover note */}
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {a.resumeUrl && <a href={`http://localhost:8080${a.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📎 View Resume</a>}
                                    </div>
                                    {a.coverNote && <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{a.coverNote}"</p>}

                                    {/* Action buttons */}
                                    {a.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-primary btn-sm" disabled={updating === a._id} onClick={() => updateStatus(a._id, 'confirmed')}>
                                                {updating === a._id ? '…' : '✅ Confirm & Create Meet'}
                                            </button>
                                            <button className="btn btn-danger btn-sm" disabled={updating === a._id} onClick={() => updateStatus(a._id, 'rejected')}>❌ Reject</button>
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

