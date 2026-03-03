import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { StatsCard, EmptyState, Spinner } from '../../components/ui/index.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { RiAddLine, RiFileList3Line } from 'react-icons/ri';

export default function EmployeeDashboard() {
    const [stats, setStats] = useState({ posts: 0, appointments: 0, pending: 0, referred: 0 });
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentAppts, setRecentAppts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/referrals/my-posts?limit=5&status=active'),
            api.get('/appointments?limit=4'),
        ]).then(([postsRes, apptsRes]) => {
            const posts = postsRes.data.data?.referrals || [];
            const appts = apptsRes.data.data?.appointments || [];
            setRecentPosts(posts);
            setRecentAppts(appts);
            setStats({
                posts: posts.length,
                appointments: appts.length,
                pending: appts.filter((a) => a.status === 'pending').length,
                referred: appts.filter((a) => a.status === 'referred').length,
            });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">Employee Dashboard</h1>
                    <p className="page-subtitle">Manage your referral posts and appointments</p>
                </div>
                <Link to="/employee/referrals/new" className="btn btn-primary"><RiAddLine /> New Referral Post</Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Active Posts', value: stats.posts, icon: '📋', color: 'var(--color-primary)' },
                    { label: 'Total Bookings', value: stats.appointments, icon: '📅', color: 'var(--color-accent)' },
                    { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'var(--color-warning)' },
                    { label: 'Referred', value: stats.referred, icon: '✅', color: 'var(--color-success)' },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <StatsCard {...s} />
                    </motion.div>
                ))}
            </div>

            {/* Recent appointments */}
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Recent Appointments</h2>
            {recentAppts.length === 0
                ? <EmptyState icon="📅" title="No appointments yet" message="Post a referral to start getting bookings" />
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recentAppts.map((a) => <AppointmentCard key={a._id} appointment={a} />)}
                </div>
            }
        </div>
    );
}
