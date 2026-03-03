import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, PriceTag, StatusBadge } from '../../components/ui/index.jsx';
import MatchScoreBadge from '../../components/MatchScoreBadge.jsx';
import { formatDate } from '../../utils/formatters';
import { RiArrowLeftLine, RiBuildingLine, RiMapPinLine, RiBriefcaseLine, RiTimeLine, RiStarLine } from 'react-icons/ri';

export default function ReferralDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [referral, setReferral] = useState(null);
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/referrals/${id}`).then(({ data }) => setReferral(data.data)).catch(() => { toast.error('Not found'); navigate('/seeker/browse'); }).finally(() => setLoading(false));
        api.get(`/resume-match/${id}`).then(({ data }) => setMatch(data.data)).catch(() => { });
    }, [id]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>;
    if (!referral) return null;

    const price = referral.finalPrice || referral.predictedPrice;
    const slots = Math.max(0, (referral.maxSlots || 5) - (referral.bookedSlots || 0));

    return (
        <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><RiArrowLeftLine /> Back</button>

            {/* Header */}
            <div className="gradient-card" style={{ padding: '24px 26px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{referral.role}</h1>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><RiBuildingLine />{referral.company}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                            {referral.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RiMapPinLine />{referral.location}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RiBriefcaseLine />{referral.jobType}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RiTimeLine />{slots > 0 ? `${slots} slots left` : 'Fully booked'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                        {match && <MatchScoreBadge score={match.score} size="lg" showLabel />}
                        <PriceTag amount={price} size="lg" />
                    </div>
                </div>
            </div>

            {/* Match card */}
            {match && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid', borderColor: match.score >= 80 ? 'rgba(0,230,118,0.3)' : 'rgba(255,179,0,0.3)', background: match.score >= 80 ? 'rgba(0,230,118,0.06)' : 'rgba(255,179,0,0.06)', marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🤖 AI Resume Match</h3>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <MatchScoreBadge score={match.score} size="md" showLabel />
                        <div style={{ flex: 1 }}>
                            {match.reasons?.map((r, i) => <p key={i} style={{ fontSize: 13, marginBottom: 3, color: 'var(--text-secondary)' }}>✅ {r}</p>)}
                            {match.missingSkills?.length > 0 && <p style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 6 }}>⚠️ Missing: {match.missingSkills.join(', ')}</p>}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Employee */}
            {referral.employee && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>About the Referrer</h3>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div className="avatar avatar-md">{referral.employee.name?.charAt(0)}</div>
                        <div>
                            <p style={{ fontWeight: 700 }}>{referral.employee.name}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{referral.employee.jobTitle} at {referral.company}</p>
                            {referral.employee.avgRating > 0 && (
                                <p style={{ fontSize: 13, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                    <RiStarLine />{referral.employee.avgRating.toFixed(1)} avg rating
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Description & Skills */}
            {referral.description && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Job Description</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{referral.description}</p>
                </div>
            )}
            {referral.skills?.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Required Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {referral.skills.map((s) => <span key={s} className="badge badge-muted">{s}</span>)}
                    </div>
                </div>
            )}

            {/* Book CTA */}
            <div style={{ position: 'sticky', bottom: 20 }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                    <div>
                        <PriceTag amount={price} size="lg" />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{slots} slot{slots !== 1 ? 's' : ''} available</p>
                    </div>
                    <button className="btn btn-primary" disabled={slots === 0} onClick={() => navigate(`/seeker/referrals/${id}/book`)}>
                        {slots === 0 ? 'Fully Booked' : '🎯 Book Appointment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
