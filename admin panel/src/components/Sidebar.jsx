import { NavLink, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
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
      { 
        icon: 'bi-box-fill', 
        label: 'Coating Production', 
        action: 'sidebar', 
        subject: 'coatingproduction',
        subLinks: [
          { to: '/coating-productions/unit/1', label: '1 Unit' },
          { to: '/coating-productions/unit/2', label: '2 Unit' },
          { to: '/coating-productions/unit/3', label: '3 Unit' },
          { to: '/coating-productions/unit/4', label: '4 Unit' },
        ]
      },
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
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    // Auto-expand menus if a sublink is active
    const newExpanded = { ...expandedMenus };
    navItems.forEach(section => {
      section.links.forEach(link => {
        if (link.subLinks && link.subLinks.some(sub => location.pathname.startsWith(sub.to.split('?')[0]))) {
          newExpanded[link.label] = true;
        }
      });
    });
    setExpandedMenus(newExpanded);
  }, [location.pathname]);

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

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
              {visibleLinks.map((link) => {
                if (link.subLinks) {
                  const isExpanded = expandedMenus[link.label];
                  return (
                    <div key={link.label} className="nav-item-container">
                      <div 
                        className="nav-item" 
                        onClick={() => toggleMenu(link.label)}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className={`bi ${link.icon} nav-icon`} />
                          <span className="nav-label">{link.label}</span>
                        </div>
                        <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'} ms-auto`} style={{ fontSize: '0.8rem' }} />
                      </div>
                      {isExpanded && (
                        <div className="nav-sub-menu ps-4 pb-2">
                          {link.subLinks.map(sub => (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              onClick={onClose}
                              className={({ isActive }) => `nav-item nav-sub-item ${isActive ? 'active' : ''}`}
                              style={{ padding: '0.5rem 1rem', marginTop: '0.2rem' }}
                            >
                              <span className="nav-label">{sub.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
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
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
