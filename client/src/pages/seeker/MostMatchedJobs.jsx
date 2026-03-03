import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';
import ReferralCard from '../../components/ReferralCard.jsx';
import MatchScoreBadge from '../../components/MatchScoreBadge.jsx';
import { useAuth } from '../../context/AuthContext';
import { RiBrainLine, RiRefreshLine, RiUploadLine, RiDeleteBinLine, RiAlertLine } from 'react-icons/ri';

const CATEGORIES = ['All', 'MERN', 'Java', 'Frontend', 'Backend', 'Data', 'Mobile', 'DevOps'];

export default function MostMatchedJobs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [computing, setComputing] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [quotaExceeded, setQuotaExceeded] = useState(false);
    const hasResume = !!user?.resume || (user?.skills?.length > 0);

    const loadMatches = async (cat = 'All') => {
        setLoading(true);
        try {
            const params = cat !== 'All' ? `?category=${cat}&limit=30` : '?limit=30';
            const { data } = await api.get(`/resume-match${params}`);
            setMatches(data.data.matches || []);
        } catch { toast.error('Failed to load matches'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadMatches(activeCategory); }, [activeCategory]);

    const runAnalysis = async () => {
        if (!hasResume) { toast.error('Please add skills or upload your resume first'); return; }
        setComputing(true);
        setQuotaExceeded(false);
        try {
            const { data } = await api.post('/resume-match/compute');
            if (data.quotaExceeded) {
                setQuotaExceeded(true);
                toast.error('Gemini API quota exhausted for today');
                return;
            }
            setMatches(data.data.matches || []);
            toast.success(`✅ Analysed ${data.data.total} jobs for you!`);
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.quotaExceeded) {
                setQuotaExceeded(true);
                toast.error('Gemini API quota exhausted for today');
            } else {
                toast.error(errData?.message || 'Analysis failed');
            }
        } finally { setComputing(false); }
    };

    const clearCache = async () => {
        setClearing(true);
        try {
            const { data } = await api.delete('/resume-match/cache');
            toast.success(`Cleared ${data.data.cleared} cached scores. Ready to recompute!`);
            setMatches([]);
            setQuotaExceeded(false);
        } catch (err) {
            toast.error('Failed to clear cache');
        } finally { setClearing(false); }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <RiBrainLine style={{ color: 'var(--color-primary)' }} /> Most Matched Jobs
                    </h1>
                    <p className="page-subtitle">AI-ranked referrals based on your resume and tech stack</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {matches.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={clearCache} disabled={clearing} title="Clear cached scores and force fresh recompute">
                            {clearing ? <Spinner size="sm" /> : <RiDeleteBinLine />} Clear Cache
                        </button>
                    )}
                    {!hasResume && (
                        <button className="btn btn-ghost" onClick={() => navigate('/profile')}>
                            <RiUploadLine /> Add Skills / Resume
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={runAnalysis} disabled={computing || !hasResume}>
                        {computing ? <><Spinner size="sm" /> Analysing…</> : <><RiRefreshLine /> Run AI Analysis</>}
                    </button>
                </div>
            </div>

            {/* Quota-exceeded banner */}
            {quotaExceeded && (
                <div style={{
                    background: 'rgba(224,152,64,0.1)',
                    border: '1px solid rgba(224,152,64,0.35)',
                    borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24,
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                    <RiAlertLine size={22} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>⚠️ Gemini API daily quota exhausted</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            The free-tier allows ~15 requests/minute and a limited number per day. Your quota resets daily.
                            <br />
                            <strong>Fix:</strong> Get a new API key at{' '}
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                                aistudio.google.com/apikey
                            </a>{' '}
                            and update <code style={{ background: 'var(--bg-surface-2)', padding: '1px 6px', borderRadius: 4 }}>GEMINI_API_KEY</code> in <code style={{ background: 'var(--bg-surface-2)', padding: '1px 6px', borderRadius: 4 }}>server/.env</code>, then restart the server.
                        </p>
                        <button className="btn btn-warm btn-sm" style={{ marginTop: 10 }} onClick={clearCache} disabled={clearing}>
                            {clearing ? <><Spinner size="sm" /> Clearing…</> : <><RiDeleteBinLine /> Clear Cached Scores & Retry Later</>}
                        </button>
                    </div>
                </div>
            )}

            {/* How-it-works info card (no resume/skills) */}
            {!hasResume && (
                <div style={{ background: 'var(--color-primary-glow)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎯 How AI Matching Works</h3>
                    <ol style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
                        <li>Add your skills or upload a PDF resume in <strong>Profile Settings</strong></li>
                        <li>Click "Run AI Analysis" — Gemini compares your profile to active referral jobs</li>
                        <li>See match score, match reasons, and missing skills for each job</li>
                        <li>Scores are also shown when you book appointments</li>
                    </ol>
                </div>
            )}

            {/* Category tabs */}
            <div className="filter-bar" style={{ marginBottom: 20 }}>
                {CATEGORIES.map((cat) => (
                    <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                ))}
            </div>

            {/* Content */}
            {loading
                ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
                : matches.length === 0
                    ? (
                        <EmptyState
                            icon="🤖"
                            title="No matches yet"
                            message={hasResume
                                ? "Click 'Run AI Analysis' to find your best matching referrals based on your profile."
                                : "Add your skills in Profile Settings to get AI-powered job matches."}
                            action={hasResume
                                ? <button className="btn btn-primary" onClick={runAnalysis} disabled={computing}>{computing ? 'Analysing…' : '🚀 Run AI Analysis'}</button>
                                : <button className="btn btn-primary" onClick={() => navigate('/profile')}>Go to Profile Settings</button>}
                        />
                    ) : (
                        <AnimatePresence>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, alignItems: 'stretch' }}>
                                {matches.map((match, i) => (
                                    <motion.div
                                        key={match._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        style={{ display: 'flex', flexDirection: 'column' }}
                                    >
                                        {/* Score banner */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '8px 14px',
                                            background: match.score >= 80
                                                ? 'rgba(92,184,122,0.12)'
                                                : match.score >= 60
                                                    ? 'rgba(224,152,64,0.10)'
                                                    : 'var(--color-primary-glow)',
                                            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                            border: '1px solid',
                                            borderColor: match.score >= 80
                                                ? 'rgba(92,184,122,0.30)'
                                                : match.score >= 60
                                                    ? 'rgba(224,152,64,0.30)'
                                                    : 'var(--border-strong)',
                                            borderBottom: 'none',
                                        }}>
                                            <MatchScoreBadge score={match.score} size="md" />
                                            <div style={{ flex: 1 }}>
                                                {match.reasons?.slice(0, 1).map((r, ri) => (
                                                    <p key={ri} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>✅ {r}</p>
                                                ))}
                                                {match.missingSkills?.length > 0 && (
                                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                        ⚠️ Missing: {match.missingSkills.slice(0, 2).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
                                            <ReferralCard referral={match.referralPost} matchScore={match.score} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    )
            }
        </div>
    );
}
