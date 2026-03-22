import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';

const SKILLS_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'SQL', 'Go'];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: '', company: '', jobTitle: '', skills: [], experienceYears: 0, currentRole: '' });
    const [skillInput, setSkillInput] = useState('');

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const addSkill = (s) => { if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]); setSkillInput(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await register(form);
            toast.success('Account created! Welcome 🎉');
            navigate(user.role === 'employee' ? '/employee/dashboard' : '/seeker/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 20 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: 460, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6C63FF,#00D9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 900, color: '#fff', fontSize: 24 }}>R</div>
                    <h1 style={{ fontSize: 22, fontWeight: 800 }}>Create Account</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                        {[1, 2].map((s) => <div key={s} style={{ width: 32, height: 4, borderRadius: 2, background: step >= s ? 'var(--color-primary)' : 'var(--border-color)', transition: 'background 0.3s' }} />)}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <form onSubmit={(e) => { e.preventDefault(); if (!form.role) { toast.error('Select a role'); return; } setStep(2); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="input-group"><label className="input-label">Full Name</label>
                                    <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" />
                                </div>
                                <div className="input-group"><label className="input-label">Email</label>
                                    <input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
                                </div>
                                <div className="input-group"><label className="input-label">Password</label>
                                    <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min 6 characters" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">I am a…</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        {['employee', 'seeker'].map((r) => (
                                            <button key={r} type="button" onClick={() => set('role', r)}
                                                style={{ padding: '14px 10px', borderRadius: 'var(--radius-md)', border: `2px solid ${form.role === r ? 'var(--color-primary)' : 'var(--border-color)'}`, background: form.role === r ? 'var(--color-primary-glow)' : 'transparent', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize', fontSize: 14, transition: 'all 0.2s', color: "var(--text-secondary)" }}>
                                                {r === 'employee' ? '🏢 Employee' : '👤 Job Seeker'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">Next <RiArrowRightLine /></button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {form.role === 'employee' ? (
                                    <>
                                        <div className="input-group"><label className="input-label">Company</label>
                                            <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Google, Meta…" />
                                        </div>
                                        <div className="input-group"><label className="input-label">Job Title</label>
                                            <input className="input" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="SDE-2, Senior Engineer…" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="input-group"><label className="input-label">Current Role</label>
                                            <input className="input" value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)} placeholder="Junior Developer…" />
                                        </div>
                                        <div className="input-group"><label className="input-label">Experience (years)</label>
                                            <input className="input" type="number" min="0" max="50" value={form.experienceYears} onChange={(e) => set('experienceYears', Number(e.target.value))} />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Skills</label>
                                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                                <input className="input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill…"
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput.trim()); } }} />
                                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => addSkill(skillInput.trim())}>Add</button>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {SKILLS_SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => addSkill(s)} className={`filter-chip ${form.skills.includes(s) ? 'active' : ''}`} style={{ fontSize: 12 }}>{s}</button>)}
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}><RiArrowLeftLine /> Back</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                        {loading ? <Spinner size="sm" /> : 'Create Account 🚀'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
