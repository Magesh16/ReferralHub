import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState, StatsCard } from '../../components/ui/index.jsx';
import ReferralCard from '../../components/ReferralCard.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { useAuth } from '../../context/AuthContext';
import { RiSearchLine, RiBrainLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

export default function SeekerDashboard() {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/referrals?limit=4&sortBy=createdAt&order=desc'),
            api.get('/appointments?limit=4'),
        ]).then(([rRes, bRes]) => {
            setReferrals(rRes.data.data?.referrals || []);
            setBookings(bRes.data.data?.appointments || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>;

    return (
        <div className="animate-fade-in">
            {/* Welcome */}
            <div style={{ padding: '20px 24px', marginBottom: 24, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,217,255,0.06))', border: '1px solid rgba(108,99,255,0.2)' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Find your next referral opportunity and land your dream job.</p>
                {!user?.resume && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                        ⚠️ <strong>Upload your resume</strong> in <Link to="/profile" style={{ color: 'var(--color-warning)' }}>Profile Settings</Link> to unlock AI job matching.
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12, marginBottom: 28 }}>
                {[
                    { label: 'Browse Referrals', icon: '🔍', to: '/seeker/browse', color: 'var(--color-primary)' },
                    { label: 'Best Matches 🤖', icon: '🧠', to: '/seeker/matched', color: 'var(--color-accent)' },
                    { label: 'My Bookings', icon: '📅', to: '/seeker/bookings', color: 'var(--color-success)' },
                    { label: 'Profile & Resume', icon: '👤', to: '/profile', color: 'var(--color-warning)' },
                ].map((action) => (
                    <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
                        <motion.div whileHover={{ y: -3 }} style={{ padding: '16px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                            <div style={{ fontSize: 24, marginBottom: 6 }}>{action.icon}</div>
                            <p style={{ fontWeight: 700, fontSize: 14, color: action.color }}>{action.label}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Latest referrals */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Latest Referral Posts</h2>
                <Link to="/seeker/browse" className="btn btn-ghost btn-sm"><RiSearchLine /> View All</Link>
            </div>
            {referrals.length === 0
                ? <EmptyState icon="📋" title="No referrals yet" message="Check back soon for new opportunities." />
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16, alignItems: 'stretch', marginBottom: 28 }}>
                    {referrals.map((r) => (
                        <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column' }}>
                            <ReferralCard referral={r} />
                        </motion.div>
                    ))}
                </div>
            }

            {/* Recent bookings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>Recent Bookings</h2>
                <Link to="/seeker/bookings" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {bookings.length === 0
                ? <EmptyState icon="📅" title="No bookings yet" message="Book a referral to get started." />
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {bookings.map((b) => <AppointmentCard key={b._id} appointment={b} />)}
                </div>
            }
        </div>
    );
}
