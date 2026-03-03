import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Spinner, EmptyState } from '../../components/ui/index.jsx';
import ReferralCard from '../../components/ReferralCard.jsx';
import { RiSearchLine, RiFilterLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { JOB_TYPES } from '../../utils/constants';

export default function BrowseReferrals() {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [jobType, setJobType] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 12, sortBy, ...(search && { search }), ...(jobType && { jobType }) });
            const { data } = await api.get(`/referrals?${params}`);
            setReferrals(data.data?.referrals || []);
            setTotalPages(data.data?.pagination?.totalPages || 1);
            setPage(p);
        } catch { toast.error('Failed to load referrals'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(1); }, [sortBy, jobType]);

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1 className="page-title">Browse Referrals</h1><p className="page-subtitle">Explore referral opportunities from employees at top companies</p></div>

            {/* Search + filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                    <RiSearchLine style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Search role, company, skill…" value={search} onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') load(1); }} style={{ paddingLeft: 36 }} />
                </div>
                <select className="input" style={{ width: 140 }} value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="">All Types</option>
                    {JOB_TYPES.map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
                </select>
                <select className="input" style={{ width: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">Latest First</option>
                    <option value="predictedPrice">Price: High→Low</option>
                    <option value="bookedSlots">Most Popular</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => load(1)}><RiSearchLine /> Search</button>
            </div>

            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>
                : referrals.length === 0 ? <EmptyState icon="🔍" title="No results" message="Try adjusting your search or filters." />
                    : <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
                            {referrals.map((r, i) => (
                                <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <ReferralCard referral={r} />
                                </motion.div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Prev</button>
                                <span style={{ padding: '6px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
                                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next →</button>
                            </div>
                        )}
                    </>
            }
        </div>
    );
}
