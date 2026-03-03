import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiBellLine, RiSunLine, RiMoonLine, RiMenuLine, RiLogoutBoxLine, RiUserLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getInitials, formatRelativeTime } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ theme, toggleTheme, toggleSidebar }) {
    const { user, logout } = useAuth();
    const { unreadCount, notifications, markAllRead } = useNotifications();
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [showUser, setShowUser] = useState(false);

    const dropdownStyle = {
        position: 'absolute', right: 0, top: 'calc(100% + 10px)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', zIndex: 999,
        boxShadow: 'var(--shadow-lg)',
    };

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            height: 'var(--navbar-height)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', zIndex: 'var(--z-navbar)',
        }}>
            {/* Left — hamburger + logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={toggleSidebar} className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
                    <RiMenuLine size={18} />
                </button>
                <Link
                    to={user?.role === 'employee' ? '/employee/dashboard' : '/seeker/dashboard'}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
                >
                    <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: '#fff', fontSize: 16,
                        boxShadow: '0 3px 10px var(--color-accent-glow)',
                    }}>R</div>
                    <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>ReferralHub</span>
                </Link>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Theme toggle */}
                <button className="btn btn-ghost btn-sm" onClick={toggleTheme} style={{ padding: 8 }} title="Toggle theme">
                    {theme === 'dark' ? <RiSunLine size={17} /> : <RiMoonLine size={17} />}
                </button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 8, position: 'relative' }}
                        onClick={() => { setShowNotif(!showNotif); setShowUser(false); if (!showNotif) markAllRead(); }}
                    >
                        <RiBellLine size={17} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 5, right: 5,
                                width: 7, height: 7, borderRadius: '50%',
                                background: 'var(--color-primary)',
                                border: '1px solid var(--bg-surface)',
                            }} />
                        )}
                    </button>
                    <AnimatePresence>
                        {showNotif && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                style={{ ...dropdownStyle, width: 320 }}
                            >
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                                    {unreadCount > 0 && <span className="badge badge-info">{unreadCount} new</span>}
                                </div>
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {notifications.length === 0
                                        ? <p style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>🔔 No notifications</p>
                                        : notifications.map((n) => (
                                            <div key={n._id} style={{
                                                padding: '10px 16px',
                                                borderBottom: '1px solid var(--border-color)',
                                                background: n.isRead ? 'transparent' : 'var(--color-primary-glow)',
                                            }}>
                                                <p style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</p>
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.message}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 'var(--radius-md)' }}
                    >
                        <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
                    </button>
                    <AnimatePresence>
                        {showUser && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                style={{ ...dropdownStyle, width: 210 }}
                            >
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                                    <p style={{ fontWeight: 700, fontSize: 13 }}>{user?.name}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
                                </div>
                                <button
                                    onClick={() => { navigate('/profile'); setShowUser(false); }}
                                    style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}
                                >
                                    <RiUserLine style={{ color: 'var(--color-primary)' }} /> Profile Settings
                                </button>
                                <button
                                    onClick={logout}
                                    style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--color-danger)' }}
                                >
                                    <RiLogoutBoxLine /> Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
}
