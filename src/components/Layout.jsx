import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MENU = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/assets', label: 'Assets' },
  { to: '/assets/new', label: 'Add asset' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="sidebar">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="2" y="7" width="28" height="18" rx="3" />
            <g>
              <rect x="7" y="11" width="2" height="10" />
              <rect x="11" y="11" width="1" height="10" />
              <rect x="14" y="11" width="3" height="10" />
              <rect x="19" y="11" width="1" height="10" />
              <rect x="22" y="11" width="2" height="10" />
            </g>
          </svg>
          <span className="brand-name">AssetDesk</span>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </div>
        <nav id="main-menu" aria-label="Main menu" className={menuOpen ? 'nav open' : 'nav'}>
          <ul>
            {MENU.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end ?? item.to === '/assets'} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="sidebar-foot">IT equipment inventory</p>
      </header>
      <main id="main" className="content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
