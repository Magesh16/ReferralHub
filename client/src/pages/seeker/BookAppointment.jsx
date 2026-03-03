import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { RiCalendarLine, RiTimeLine, RiFileLine, RiArrowLeftLine, RiCheckLine, RiUploadLine, RiBrainLine, RiCloseLine } from 'react-icons/ri';
import { Spinner, PriceTag } from '../../components/ui/index.jsx';
import MatchScoreBadge from '../../components/MatchScoreBadge.jsx';

const TIME_SLOTS = ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '12:00 PM - 12:30 PM', '02:00 PM - 02:30 PM', '03:00 PM - 03:30 PM', '04:00 PM - 04:30 PM', '05:00 PM - 05:30 PM'];

export default function BookAppointment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [referral, setReferral] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [hasExtractedText, setHasExtractedText] = useState(false);
    const [matchData, setMatchData] = useState(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [form, setForm] = useState({ scheduledDate: '', scheduledTime: '', coverNote: '' });

    useEffect(() => {
        api.get(`/referrals/${id}`).then(({ data }) => setReferral(data.data)).catch(() => { toast.error('Not found'); navigate('/seeker/browse'); }).finally(() => setLoading(false));
        api.get(`/resume-match/${id}`).then(({ data }) => { if (data.data) setMatchData(data.data); }).catch(() => { });
    }, [id]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) { toast.error('Only PDF, DOC, DOCX allowed'); return; }
        setUploadedFile(file);
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('resume', file);
            const { data } = await api.post('/upload/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResumeUrl(data.data.fileUrl);
            setHasExtractedText(data.data.hasExtractedText);
            toast.success(data.data.message);
            if (data.data.hasExtractedText) {
                setMatchLoading(true);
                api.get(`/resume-match/${id}`).then(({ data: d }) => setMatchData(d.data)).catch(() => { }).finally(() => setMatchLoading(false));
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); setUploadedFile(null); }
        finally { setUploading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeUrl) return toast.error('Please upload your resume');
        if (!form.scheduledDate || !form.scheduledTime) return toast.error('Select date and time');
        setBooking(true);
        try {
            await api.post('/appointments', { referralPostId: id, resumeUrl, matchScore: matchData?.score ?? null, matchReasons: matchData?.reasons ?? [], missingSkills: matchData?.missingSkills ?? [], ...form });
            toast.success('Appointment booked! 🎉');
            navigate('/seeker/bookings');
        } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
        finally { setBooking(false); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>;
    const price = referral?.finalPrice || referral?.predictedPrice;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><RiArrowLeftLine /> Back</button>
            <div className="page-header"><h1 className="page-title">Book Appointment</h1><p className="page-subtitle">Schedule your referral session with {referral?.employee?.name}</p></div>

            <div className="gradient-card" style={{ padding: '16px 18px', borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><p style={{ fontWeight: 800, fontSize: 15 }}>{referral?.role}</p><p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{referral?.company}</p></div>
                    <PriceTag amount={price} size="md" />
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Resume Upload */}
                <div className="card-elevated" style={{ padding: '20px 18px' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><RiUploadLine style={{ color: 'var(--color-primary)' }} /> Upload Resume *</h2>
                    {!uploadedFile ? (
                        <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileChange({ target: { files: [f] } }); }}
                            style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '28px', textAlign: 'center', cursor: 'pointer' }}>
                            <RiUploadLine size={28} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop resume here or Browse</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF, DOC, DOCX · max 5MB</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                            <RiFileLine size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFile.name}</p>
                                <p style={{ fontSize: 11, color: uploading ? 'var(--text-muted)' : hasExtractedText ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                    {uploading ? '⏳ Uploading...' : hasExtractedText ? '✅ Text extracted — AI match ready' : '⚠️ Use PDF for best AI matching'}
                                </p>
                            </div>
                            {!uploading && <button type="button" onClick={() => { setUploadedFile(null); setResumeUrl(''); setMatchData(null); }} style={{ background: 'none', cursor: 'pointer', color: 'var(--text-muted)', border: 'none' }}><RiCloseLine size={18} /></button>}
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>

                {/* Match card */}
                {(matchLoading || matchData) && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ border: '1px solid', borderColor: (matchData?.score || 0) >= 80 ? 'rgba(0,230,118,0.35)' : 'rgba(108,99,255,0.3)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', background: (matchData?.score || 0) >= 80 ? 'rgba(0,230,118,0.06)' : 'rgba(108,99,255,0.06)' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><RiBrainLine style={{ color: 'var(--color-primary)' }} /> AI Resume Match</h3>
                        {matchLoading ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Spinner size="sm" /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Analysing...</span></div>
                            : matchData && (
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <MatchScoreBadge score={matchData.score} size="lg" showLabel />
                                    <div style={{ flex: 1 }}>
                                        {matchData.reasons?.map((r, i) => <p key={i} style={{ fontSize: 13, marginBottom: 4, color: 'var(--text-secondary)' }}>✅ {r}</p>)}
                                        {matchData.missingSkills?.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warning)', marginBottom: 4 }}>⚠️ Skills to strengthen:</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {matchData.missingSkills.map((s) => <span key={s} className="badge" style={{ background: 'rgba(255,179,0,0.15)', color: 'var(--color-warning)', fontSize: 11 }}>{s}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </motion.div>
                )}

                {/* Date */}
                <div className="card-elevated" style={{ padding: '20px 18px' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><RiCalendarLine style={{ color: 'var(--color-primary)' }} /> Select Date</h2>
                    <input className="input" type="date" min={minDate} required value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} style={{ maxWidth: 220 }} />
                </div>

                {/* Time slots */}
                <div className="card-elevated" style={{ padding: '20px 18px' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><RiTimeLine style={{ color: 'var(--color-primary)' }} /> Select Time Slot</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {TIME_SLOTS.map((slot) => (
                            <button key={slot} type="button" className={`filter-chip ${form.scheduledTime === slot ? 'active' : ''}`} style={{ justifyContent: 'center', borderRadius: 'var(--radius-md)' }} onClick={() => setForm({ ...form, scheduledTime: slot })}>
                                {form.scheduledTime === slot && <RiCheckLine />}{slot}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cover note */}
                <div className="card-elevated" style={{ padding: '20px 18px' }}>
                    <div className="input-group">
                        <label className="input-label">Cover Note (optional)</label>
                        <textarea className="input" rows={3} placeholder="Briefly explain your strengths and fit for this role…" value={form.coverNote} onChange={(e) => setForm({ ...form, coverNote: e.target.value })} style={{ resize: 'vertical' }} />
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={booking || !resumeUrl} style={{ flex: 1 }}>
                        {booking ? 'Processing...' : `🎯 Confirm Booking — ₹${price?.toLocaleString('en-IN')}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
