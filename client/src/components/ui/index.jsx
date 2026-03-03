import { getInitials, getStatusBadge } from '../../utils/formatters';

export function Avatar({ name = '', size = 'md' }) {
    return <div className={`avatar avatar-${size}`}>{getInitials(name)}</div>;
}

export function Badge({ children, variant = 'muted' }) {
    return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Spinner({ size = 'md' }) {
    const s = size === 'sm' ? 16 : size === 'lg' ? 40 : 24;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-primary)" strokeWidth="3"
                strokeDasharray="40" strokeDashoffset="10" />
        </svg>
    );
}

export function LoadingScreen() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', flexDirection: 'column', gap: 20, background: 'var(--bg-base)',
        }}>
            {/* Warm coral logo */}
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#fff', fontSize: 26,
                boxShadow: '0 8px 24px var(--color-accent-glow)',
                animation: 'pulse 1.5s ease-in-out infinite',
            }}>R</div>
            <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(0.95)}}`}</style>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading ReferralHub…</p>
        </div>
    );
}

export function EmptyState({ icon = '📭', title, message, action }) {
    return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
            {message && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{message}</p>}
            {action}
        </div>
    );
}

export function StatsCard({ label, value, icon, color = 'var(--color-primary)', sub }) {
    return (
        <div className="stats-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{
                        fontSize: 11, color: 'var(--text-muted)', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
                    }}>{label}</p>
                    <p style={{ fontSize: 28, fontWeight: 900, color }}>{value}</p>
                    {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</p>}
                </div>
                {icon && (
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'var(--color-primary-glow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                    }}>{icon}</div>
                )}
            </div>
        </div>
    );
}

export function PriceTag({ amount, size = 'md' }) {
    const s = size === 'sm' ? 13 : size === 'lg' ? 20 : 16;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 2,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 900, fontSize: s,
        }}>
            ₹{(amount || 0).toLocaleString('en-IN')}
        </span>
    );
}

export function StatusBadge({ status }) {
    const { label, class: cls } = getStatusBadge(status);
    return <span className={`badge ${cls}`}>{label}</span>;
}
