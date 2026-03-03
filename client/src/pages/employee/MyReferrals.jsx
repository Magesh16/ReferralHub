import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState, StatusBadge, PriceTag } from '../../components/ui/index.jsx';
import { RiAddLine, RiPencilLine } from 'react-icons/ri';
import { formatDate } from '../../utils/formatters';
import { motion } from 'framer-motion';

export default function MyReferrals() {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const { data } = await api.get(`/referrals/my-posts${params}`);
            setReferrals(data.data?.referrals || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filter]);

    const toggleStatus = async (id, current) => {
        const next = current === 'active' ? 'paused' : 'active';
        try {
            await api.patch(`/referrals/${id}/status`, { status: next });
            setReferrals((prev) => prev.map((r) => r._id === id ? { ...r, status: next } : r));
            toast.success(`Post ${next}`);
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div><h1 className="page-title">My Referral Posts</h1><p className="page-subtitle">Manage your active referral listings</p></div>
                <Link to="/employee/referrals/new" className="btn btn-primary"><RiAddLine /> New Post</Link>
            </div>

            <div className="filter-bar" style={{ marginBottom: 20 }}>
                {['all', 'active', 'paused', 'closed'].map((s) => (
                    <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
                ))}
            </div>

            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
                : referrals.length === 0 ? <EmptyState icon="📋" title="No posts yet" message="Create your first referral post to get started." action={<Link to="/employee/referrals/new" className="btn btn-primary"><RiAddLine /> Create Post</Link>} />
                    : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {referrals.map((r) => (
                                <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: 15 }}>{r.role}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.company} · {r.jobType} · {r.location || 'Remote'}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                                {(r.skills || []).slice(0, 4).map((s) => <span key={s} className="badge badge-muted" style={{ fontSize: 11 }}>{s}</span>)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                            <StatusBadge status={r.status} />
                                            <PriceTag amount={r.finalPrice || r.predictedPrice} size="sm" />
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.bookedSlots || 0}/{r.maxSlots} slots booked</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(r._id, r.status)}>
                                            {r.status === 'active' ? '⏸ Pause' : '▶️ Activate'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
        </div>
    );
}
