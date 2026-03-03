import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiBuildingLine, RiMapPinLine, RiBriefcaseLine, RiStarLine, RiTimeLine, RiArrowRightLine } from 'react-icons/ri';
import { PriceTag, StatusBadge } from './ui/index.jsx';
import MatchScoreBadge from './MatchScoreBadge.jsx';

export default function ReferralCard({ referral, matchScore }) {
    const navigate = useNavigate();
    const price = referral.finalPrice || referral.predictedPrice;
    const slotsLeft = Math.max(0, (referral.maxSlots || 5) - (referral.bookedSlots || 0));

    const score = matchScore ?? referral.matchScore;

    return (
        <div className="referral-card" onClick={() => navigate(`/seeker/referrals/${referral._id}`)}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        fontWeight: 800, fontSize: 15,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginBottom: 3,
                    }}>{referral.role}</h3>
                    <p style={{
                        color: 'var(--text-secondary)', fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <RiBuildingLine size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {referral.company}
                        </span>
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    {score != null && <MatchScoreBadge score={score} size="sm" />}
                    <StatusBadge status={referral.status || 'active'} />
                </div>
            </div>

            {/* Meta row */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 10,
                fontSize: 12, color: 'var(--text-muted)',
            }}>
                {referral.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <RiMapPinLine size={12} />{referral.location}
                    </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <RiBriefcaseLine size={12} />{referral.jobType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <RiTimeLine size={12} />{slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft > 1 ? 's' : ''}` : 'Full'}
                </span>
            </div>

            {/* Skills */}
            {referral.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {referral.skills.slice(0, 3).map((s) => (
                        <span key={s} className="badge badge-primary" style={{ fontSize: 11 }}>{s}</span>
                    ))}
                    {referral.skills.length > 3 && (
                        <span className="badge badge-muted" style={{ fontSize: 11 }}>+{referral.skills.length - 3}</span>
                    )}
                </div>
            )}

            {/* Footer — always at bottom */}
            <div style={{
                marginTop: 'auto',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 12, borderTop: '1px solid var(--border-color)',
            }}>
                <PriceTag amount={price} size="md" />
                <span style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    View <RiArrowRightLine size={13} />
                </span>
            </div>
        </div>
    );
}
