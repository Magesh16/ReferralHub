import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import { getInitials } from '../utils/formatters';
import { RiUserLine, RiBuildingLine, RiLinkedinFill, RiFileLine, RiUploadLine, RiCheckLine, RiLockLine, RiCloseLine, RiAddLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

function Section({ icon, title, children }) {
    return (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-2)' }}>
                <span style={{ color: 'var(--color-primary)', fontSize: 18 }}>{icon}</span>
                <h2 style={{ fontWeight: 700, fontSize: 15 }}>{title}</h2>
            </div>
            <div style={{ padding: '20px' }}>{children}</div>
        </div>
    );
}

function SkillInput({ skills, onChange }) {
    const [input, setInput] = useState('');
    const add = () => { const s = input.trim(); if (s && !skills.includes(s)) onChange([...skills, s]); setInput(''); };
    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {skills.map((s) => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(108,99,255,0.15)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>
                        {s}<button type="button" onClick={() => onChange(skills.filter((x) => x !== s))} style={{ background: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0, border: 'none' }}><RiCloseLine size={13} /></button>
                    </span>
                ))}
                {skills.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills added yet</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Add a skill (e.g. React)" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} style={{ flex: 1 }} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={add}><RiAddLine /> Add</button>
            </div>
        </div>
    );
}

export default function Profile() {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({ name: '', phone: '', linkedinUrl: '', company: '', jobTitle: '', department: '', yearsAtCompany: '', skills: [], experienceYears: '', currentRole: '' });
    const [saving, setSaving] = useState(false);
    const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [hasExtractedText, setHasExtractedText] = useState(false);

    useEffect(() => {
        if (!user) return;
        setForm({ name: user.name || '', phone: user.phone || '', linkedinUrl: user.linkedinUrl || '', company: user.company || '', jobTitle: user.jobTitle || '', department: user.department || '', yearsAtCompany: user.yearsAtCompany || '', skills: user.skills || [], experienceYears: user.experienceYears || '', currentRole: user.currentRole || '' });
        if (user.resume) setResumeUrl(user.resume);
    }, [user]);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) { toast.error('Only PDF, DOC, DOCX allowed'); return; }
        setUploadedFile(file); setUploading(true);
        try {
            const fd = new FormData(); fd.append('resume', file);
            const { data } = await api.post('/upload/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResumeUrl(data.data.fileUrl); setHasExtractedText(data.data.hasExtractedText);
            toast.success(data.data.message);
            if (updateUser) updateUser((prev) => ({ ...prev, resume: data.data.fileUrl }));
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); setUploadedFile(null); }
        finally { setUploading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const payload = { ...form };
            if (user.role === 'employee') { delete payload.skills; delete payload.experienceYears; delete payload.currentRole; }
            else { delete payload.company; delete payload.jobTitle; delete payload.department; delete payload.yearsAtCompany; }
            const { data } = await api.put('/auth/profile', payload);
            if (updateUser) updateUser(data.data);
            toast.success('Profile saved! ✅');
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
        if (pwForm.newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
        setPwSaving(true);
        try { await api.put('/auth/profile', { password: pwForm.newPassword }); setPwForm({ newPassword: '', confirm: '' }); toast.success('Password changed! 🔒'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setPwSaving(false); }
    };

    if (!user) return <div style={{ padding: 80, textAlign: 'center' }}><Spinner /></div>;
    const isSeeker = user.role === 'seeker';

    return (
        <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="page-header"><h1 className="page-title">Profile Settings</h1><p className="page-subtitle">Manage your info{isSeeker ? ', resume, and skills' : ' and company details'}</p></div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,217,255,0.08))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(108,99,255,0.2)' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{getInitials(user.name)}</div>
                <div>
                    <p style={{ fontSize: 20, fontWeight: 800 }}>{user.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</p>
                    <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, background: isSeeker ? 'rgba(0,217,255,0.15)' : 'rgba(108,99,255,0.15)', color: isSeeker ? '#00D9FF' : 'var(--color-primary)', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{user.role}</span>
                </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Section icon={<RiUserLine />} title="Basic Information">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group"><label className="input-label">Full Name *</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
                        <div className="input-group"><label className="input-label">Phone Number</label><input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email: {user.email} (cannot be changed)</p>
                </Section>

                {!isSeeker && (
                    <Section icon={<RiBuildingLine />} title="Work Details">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="input-group"><label className="input-label">Company</label><input className="input" placeholder="Google, Amazon…" value={form.company} onChange={(e) => set('company', e.target.value)} /></div>
                            <div className="input-group"><label className="input-label">Job Title</label><input className="input" placeholder="SDE-2…" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} /></div>
                            <div className="input-group"><label className="input-label">Department</label><input className="input" placeholder="Engineering…" value={form.department} onChange={(e) => set('department', e.target.value)} /></div>
                            <div className="input-group"><label className="input-label">Years at Company</label><input className="input" type="number" min="0" value={form.yearsAtCompany} onChange={(e) => set('yearsAtCompany', e.target.value)} /></div>
                        </div>
                        <div className="input-group" style={{ marginTop: 12 }}>
                            <label className="input-label">LinkedIn URL</label>
                            <div style={{ position: 'relative' }}>
                                <RiLinkedinFill style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} style={{ paddingLeft: 36 }} />
                            </div>
                        </div>
                    </Section>
                )}

                {isSeeker && (
                    <Section icon={<RiBuildingLine />} title="Professional Details">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div className="input-group"><label className="input-label">Current Role</label><input className="input" placeholder="Junior Developer…" value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)} /></div>
                            <div className="input-group"><label className="input-label">Experience (years)</label><input className="input" type="number" min="0" value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} /></div>
                        </div>
                        <div className="input-group"><label className="input-label">Skills</label><SkillInput skills={form.skills} onChange={(s) => set('skills', s)} /></div>
                    </Section>
                )}

                {isSeeker && (
                    <Section icon={<RiFileLine />} title="Resume">
                        {resumeUrl && !uploadedFile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 14, background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 'var(--radius-md)' }}>
                                <RiFileLine size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 13 }}>Resume uploaded ✅</p><p style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{resumeUrl}</p></div>
                                <a href={`http://localhost:8080${resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
                            </div>
                        )}
                        <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileChange({ target: { files: [f] } }); }}
                            style={{ border: `2px dashed ${uploadedFile ? 'var(--color-success)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: uploadedFile ? 'rgba(0,230,118,0.04)' : 'transparent' }}>
                            {uploading ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}><Spinner /><p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Uploading & extracting text…</p></div>
                                : uploadedFile ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <RiCheckLine size={28} style={{ color: 'var(--color-success)' }} />
                                        <p style={{ fontWeight: 700, fontSize: 14 }}>{uploadedFile.name}</p>
                                        <p style={{ fontSize: 12, color: hasExtractedText ? 'var(--color-success)' : 'var(--color-warning)' }}>{hasExtractedText ? '✅ AI matching is ready!' : '⚠️ PDF recommended for AI matching'}</p>
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>Replace</button>
                                    </div>
                                ) : (
                                    <><RiUploadLine size={28} style={{ color: 'var(--color-primary)', marginBottom: 8 }} /><p style={{ fontWeight: 600, marginBottom: 4 }}>{resumeUrl ? 'Upload new resume' : 'Upload your resume'}</p><p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>PDF recommended · max 5MB</p><button type="button" className="btn btn-ghost btn-sm">Browse Files</button></>
                                )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>💡 PDF upload unlocks AI-powered matching on the <strong>Best Matches</strong> page.</p>
                    </Section>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : <><RiCheckLine /> Save Profile</>}</button>
                </div>
            </form>

            <form onSubmit={handlePasswordChange} style={{ marginTop: 20, marginBottom: 40 }}>
                <Section icon={<RiLockLine />} title="Change Password">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group"><label className="input-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} style={{ paddingRight: 40 }} />
                                <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', border: 'none' }}>{showPw ? <RiEyeOffLine /> : <RiEyeLine />}</button>
                            </div>
                        </div>
                        <div className="input-group"><label className="input-label">Confirm Password</label><input className="input" type={showPw ? 'text' : 'password'} placeholder="Repeat new password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <button type="submit" className="btn btn-ghost" disabled={pwSaving || !pwForm.newPassword}>{pwSaving ? 'Changing…' : <><RiLockLine /> Change Password</>}</button>
                    </div>
                </Section>
            </form>
        </div>
    );
}
