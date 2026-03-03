import { StatusBadge, PriceTag } from './ui/index.jsx';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import MatchScoreBadge from './MatchScoreBadge.jsx';
import { RiCalendarLine, RiTimeLine, RiBuildingLine } from 'react-icons/ri';

export default function AppointmentCard({ appointment }) {
    const { referralPost, scheduledDate, scheduledTime, status, matchScore } = appointment;
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15 }}>{referralPost?.role || 'Referral Session'}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <RiBuildingLine size={13} />{referralPost?.company || '—'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {matchScore !== null && matchScore !== undefined && <MatchScoreBadge score={matchScore} size="sm" />}
                    <StatusBadge status={status} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                {scheduledDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <RiCalendarLine size={13} />{formatDate(scheduledDate)}
                    </span>
                )}
                {scheduledTime && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <RiTimeLine size={13} />{scheduledTime}
                    </span>
                )}
            </div>
            {matchScore !== null && matchScore !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: matchScore >= 80 ? 'rgba(0,230,118,0.07)' : matchScore >= 60 ? 'rgba(255,179,0,0.07)' : 'rgba(108,99,255,0.07)', borderRadius: 'var(--radius-sm)' }}>
                    <MatchScoreBadge score={matchScore} size="sm" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Resume match score for this referral</span>
                </div>
            )}
        </div>
    );
}
