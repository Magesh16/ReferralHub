import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}! 👋`);
            navigate(user.role === 'employee' ? '/employee/dashboard' : '/seeker/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'var(--bg-base)',
            /* subtle grain texture via SVG data URI */
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}>

            {/* ── Left — decorative panel ───────────────────────────────── */}
            <div style={{
                display: 'none',
                width: '42%',
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-color)',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 56px',
                '@media(min-width:768px)': { display: 'flex' },
            }}
                className="login-panel"
            >
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: '#fff', fontSize: 26, marginBottom: 36,
                    boxShadow: '0 8px 24px var(--color-accent-glow)',
                }}>R</div>

                <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.3 }}>
                    Your next great<br />referral is here.
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 320 }}>
                    Connect directly with insiders at top companies. Skip the queue — get referred by someone who already works there.
                </p>

                {/* Testimonial */}
                <div style={{
                    marginTop: 48, padding: '20px 22px',
                    background: 'var(--bg-base)', borderRadius: 14,
                    border: '1px solid var(--border-color)',
                }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.7 }}>
                        "Got a referral to Google within 3 days. Interview scheduled the next week. Absolutely worth it."
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 10 }}>
                        — Sana K., Frontend Engineer
                    </p>
                </div>
            </div>

            {/* ── Right — login form ────────────────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{
                        width: '100%',
                        maxWidth: 400,
                    }}
                >
                    {/* Header */}
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Sign in</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Welcome back to ReferralHub</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <RiMailLine style={{
                                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)', fontSize: 16,
                                }} />
                                <input
                                    type="email" required placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    style={{
                                        width: '100%', padding: '11px 14px 11px 38px',
                                        border: '1.5px solid var(--border-color)', borderRadius: 10,
                                        background: '#FFFFFF', color: 'grey',
                                        fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-glow)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <RiLockLine style={{
                                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)', fontSize: 16,
                                }} />
                                <input
                                    type={showPw ? 'text' : 'password'} required placeholder="Your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    style={{
                                        width: '100%', padding: '11px 44px 11px 38px',
                                        border: '1.5px solid var(--border-color)', borderRadius: 10,
                                        background: '#FFFFFF', color: 'grey',
                                        fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-glow)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4,
                                }}>
                                    {showPw ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '12px 20px', marginTop: 4,
                                borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading ? 'var(--border-color)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: loading ? 'none' : '0 4px 16px var(--color-primary-glow)',
                                transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                        >
                            {loading ? <Spinner size="sm" /> : 'Sign In'}
                        </button>
                    </form>

                    {/* Register link */}
                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary-dark)', fontWeight: 700, textDecoration: 'none' }}>
                            Create one
                        </Link>
                    </p>

                    {/* Quick-fill demo credentials */}
                    <div style={{
                        marginTop: 28, padding: '14px 16px',
                        background: 'var(--bg-surface)', borderRadius: 12,
                        border: '1px solid var(--border-color)',
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            ⚡ Quick Login (click to fill)
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {[
                                { label: '🏢 Employee', email: 'magi@example.com' },
                                { label: '👤 Seeker', email: 'sana@example.com' },
                            ].map(({ label, email }) => (
                                <button
                                    key={email}
                                    type="button"
                                    onClick={() => setForm({ email, password: 'password123' })}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                        background: 'var(--bg-base)', border: '1px solid var(--border-color)',
                                        fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)',
                                        transition: 'border-color 0.12s, background 0.12s',
                                        fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-base)'; }}
                                >
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{email}</span>
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.8, marginTop: 8 }}>
                            Password: <code style={{ fontFamily: 'monospace', background: 'var(--bg-surface-2)', padding: '1px 5px', borderRadius: 4 }}>password123</code>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Responsive: show left panel on wider screens */}
            <style>{`
        @media (min-width: 768px) { .login-panel { display: flex !important; } }
      `}</style>
        </div>
    );
}
