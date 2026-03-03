// MatchScoreBadge — circular SVG score ring
export default function MatchScoreBadge({ score, size = 'md', showLabel = false, style = {} }) {
    if (score === null || score === undefined) return null;
    const sizeMap = { sm: { width: 36, fontSize: 10, stroke: 3 }, md: { width: 48, fontSize: 13, stroke: 4 }, lg: { width: 64, fontSize: 16, stroke: 5 } };
    const { width, fontSize, stroke } = sizeMap[size] || sizeMap.md;
    const r = (width - stroke * 2) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : score >= 40 ? '#00D9FF' : 'var(--color-danger)';
    const label = score >= 80 ? 'Great Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Partial Match' : 'Low Match';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, ...style }}>
            <div style={{ position: 'relative', width, height: width }}>
                <svg width={width} height={width} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={width / 2} cy={width / 2} r={r} fill="none" stroke="var(--bg-surface-2)" strokeWidth={stroke} />
                    <circle cx={width / 2} cy={width / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                </svg>
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
            </div>
            {showLabel && <span style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: 'nowrap' }}>{label}</span>}
        </div>
    );
}
