import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AbilityContext, Can } from '../context/AbilityContext';
import logo from '../assets/hero.png';

const navItems = [
  {
    section: 'Main',
    links: [
      { to: '/', icon: 'bi-grid-1x2-fill', label: 'Dashboard', action: 'sidebar', subject: 'dashboard' },
    ],
  },
  {
    section: 'Management',
    links: [
      { to: '/users', icon: 'bi-people-fill', label: 'Users', action: 'sidebar', subject: 'user' },
      { to: '/companies', icon: 'bi-building-fill', label: 'Companies', action: 'sidebar', subject: 'company' },
      { to: '/brands', icon: 'bi-award-fill', label: 'Brands', action: 'sidebar', subject: 'brand' },
      { to: '/printing-types', icon: 'bi-printer-fill', label: 'Printing Types', action: 'sidebar', subject: 'printing-type' },
      { to: '/printing-colors', icon: 'bi-palette-fill', label: 'Printing Colors', action: 'sidebar', subject: 'printing-color' },
      { to: '/coating-types', icon: 'bi-brush-fill', label: 'Coating Types', action: 'sidebar', subject: 'coating-type' },
      { to: '/coating-colors', icon: 'bi-droplet-half', label: 'Coating Colors', action: 'sidebar', subject: 'coating-color' },
      { to: '/bottle-specs', icon: 'bi-droplet-fill', label: 'Bottle Specs', action: 'sidebar', subject: 'bottlespec' },
      { to: '/variants', icon: 'bi-layers-fill', label: 'Variants', action: 'sidebar', subject: 'variant' },
      { to: '/productions', icon: 'bi-box-seam-fill', label: 'Printing Production', action: 'sidebar', subject: 'production' },
      //{ to: '/production', icon: 'bi-box-fill', label: 'Production', action: 'sidebar', subject: 'production' },
    ],
  },
  {
    section: 'System',
    links: [
      { to: '/permissions', icon: 'bi-key-fill', label: 'Permissions', action: 'sidebar', subject: 'permission' },
      { to: '/roles', icon: 'bi-shield-lock-fill', label: 'Roles', action: 'sidebar', subject: 'role' },
    ],
  },
];

export default function Sidebar({ collapsed, onClose }) {
  const ability = useContext(AbilityContext);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand" style={{ justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <img src={logo} alt="Logo" style={{ height: '60px', maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        <button className="mobile-close-btn btn btn-sm btn-link text-white shadow-none p-0" onClick={onClose} style={{ position: 'absolute', right: '15px' }}>
          <i className="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((section) => {
          const visibleLinks = section.links.filter(link =>
            ability.can(link.action || 'read', link.subject || 'all')
          );

          if (visibleLinks.length === 0) return null;

          return (
            <div key={section.section} className="mb-2">
              <div className="nav-section-title">{section.section}</div>
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <i className={`bi ${link.icon} nav-icon`} />
                  <span className="nav-label">{link.label}</span>
                  {link.badge && <span className="nav-badge">{link.badge}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
