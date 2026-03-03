import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui/index.jsx';
import { RiArrowLeftLine, RiAddLine, RiCloseLine } from 'react-icons/ri';
import { POPULAR_COMPANIES, POPULAR_ROLES, JOB_TYPES } from '../../utils/constants';

const SKILLS_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'Kubernetes', 'Go', 'C++', 'Angular', 'Vue.js'];

export default function CreateReferral() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ company: '', role: '', department: '', description: '', location: '', jobType: 'full-time', experienceMin: 0, experienceMax: 5, skills: [], maxSlots: 5 });
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const addSkill = (s) => { const t = s.trim(); if (t && !form.skills.includes(t)) set('skills', [...form.skills, t]); setSkillInput(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.company || !form.role) return toast.error('Company and Role are required');
        setLoading(true);
        try {
            await api.post('/referrals', form);
            toast.success('Referral post created! 🎉');
            navigate('/employee/referrals');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally { setLoading(false); }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><RiArrowLeftLine /> Back</button>
            <div className="page-header"><h1 className="page-title">Create Referral Post</h1><p className="page-subtitle">Post a referral opportunity at your company</p></div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="card-elevated" style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14 }}>Job Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="input-group"><label className="input-label">Company *</label>
                            <input className="input" list="companies" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Google, Amazon…" required />
                            <datalist id="companies">{POPULAR_COMPANIES.map((c) => <option key={c} value={c} />)}</datalist>
                        </div>
                        <div className="input-group"><label className="input-label">Role *</label>
                            <input className="input" list="roles" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="SDE-2, PM…" required />
                            <datalist id="roles">{POPULAR_ROLES.map((r) => <option key={r} value={r} />)}</datalist>
                        </div>
                        <div className="input-group"><label className="input-label">Department</label>
                            <input className="input" value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="Engineering, Product…" />
                        </div>
                        <div className="input-group"><label className="input-label">Location</label>
                            <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Bangalore, Remote…" />
                        </div>
                        <div className="input-group"><label className="input-label">Job Type</label>
                            <select className="input" value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
                                {JOB_TYPES.map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
                            </select>
                        </div>
                        <div className="input-group"><label className="input-label">Max Booking Slots</label>
                            <input className="input" type="number" min="1" max="50" value={form.maxSlots} onChange={(e) => set('maxSlots', Number(e.target.value))} />
                        </div>
                        <div className="input-group"><label className="input-label">Min Experience (yrs)</label>
                            <input className="input" type="number" min="0" max="30" value={form.experienceMin} onChange={(e) => set('experienceMin', Number(e.target.value))} />
                        </div>
                        <div className="input-group"><label className="input-label">Max Experience (yrs)</label>
                            <input className="input" type="number" min="0" max="30" value={form.experienceMax} onChange={(e) => set('experienceMax', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="input-group"><label className="input-label">Job Description</label>
                        <textarea className="input" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for…" style={{ resize: 'vertical' }} />
                    </div>
                </div>

                {/* Skills */}
                <div className="card-elevated" style={{ padding: '20px 18px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Required Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {form.skills.map((s) => (
                            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(108,99,255,0.15)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>
                                {s}<button type="button" onClick={() => set('skills', form.skills.filter((x) => x !== s))} style={{ background: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0, border: 'none' }}><RiCloseLine size={13} /></button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input className="input" placeholder="Type a skill…" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => addSkill(skillInput)}><RiAddLine /></button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {SKILLS_SUGGESTIONS.map((s) => (
                            <button key={s} type="button" onClick={() => addSkill(s)} className={`filter-chip ${form.skills.includes(s) ? 'active' : ''}`} style={{ fontSize: 11 }}>{s}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                        {loading ? <Spinner size="sm" /> : '🚀 Publish Referral Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
