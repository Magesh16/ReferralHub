import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    RiDashboardLine, RiFileList3Line, RiCalendarLine,
    RiSearchLine, RiBookmarkLine, RiRocketLine, RiBrainLine, RiUserSettingsLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatters';

const EMPLOYEE_LINKS = [
    { to: '/employee/dashboard', icon: <RiDashboardLine />, label: 'Dashboard' },
    { to: '/employee/referrals', icon: <RiFileList3Line />, label: 'My Referrals' },
    { to: '/employee/appointments', icon: <RiCalendarLine />, label: 'Appointments' },
    { to: '/profile', icon: <RiUserSettingsLine />, label: 'Profile Settings' },
];

const SEEKER_LINKS = [
    { to: '/seeker/dashboard', icon: <RiDashboardLine />, label: 'Dashboard' },
    { to: '/seeker/browse', icon: <RiSearchLine />, label: 'Browse' },
    { to: '/seeker/matched', icon: <RiBrainLine />, label: 'Best Matches 🤖' },
    { to: '/seeker/bookings', icon: <RiBookmarkLine />, label: 'My Bookings' },
    { to: '/profile', icon: <RiUserSettingsLine />, label: 'Profile Settings' },
];

export default function Sidebar({ isOpen }) {
    const { user } = useAuth();
    const links = user?.role === 'employee' ? EMPLOYEE_LINKS : SEEKER_LINKS;

    return (
        <motion.aside
            initial={false}
            animate={{ x: isOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                width: 'var(--sidebar-width)',
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', gap: 2,
                padding: '72px 12px 24px',
                zIndex: 'var(--z-sidebar)',
                transition: 'background var(--transition-base)',
                overflowY: 'auto',
            }}
        >
            {/* User pill */}
            {user && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', marginBottom: 16,
                    background: 'var(--color-primary-glow)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                }}>
                    <div className="avatar avatar-sm">{getInitials(user.name)}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{
                            fontSize: 13, fontWeight: 700,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                </div>
            )}

            {/* Section label */}
            <p style={{
                fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '0 12px', marginBottom: 6,
            }}>Navigation</p>

            {/* Nav links */}
            {links.map((link) => (
                <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--color-primary-glow2)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                })}>
                    <span style={{ fontSize: 17 }}>{link.icon}</span>
                    {link.label}
                </NavLink>
            ))}

            {/* Footer branding */}
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: '#fff', fontSize: 14,
                        boxShadow: '0 4px 12px var(--color-accent-glow)',
                    }}>R</div>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>ReferralHub</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>v1.0 · MVP</p>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
