import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user: userProfile, logout } = useAuth();
  const session = userProfile;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Scroll effect ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getAvatarUrl = () => userProfile?.user_metadata?.avatar_url || null;

  const getAvatarInitials = () => {
    const name =
      userProfile?.user_metadata?.full_name || userProfile?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const navLinks = [
    { to: '/#how-it-works', label: 'How it Works' },
    { to: '/#features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/builder', label: 'Resources' },
    ...(session ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        {/* ── Logo ── */}
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <span className="navbar__logo-mark">CF</span>
          <span className="navbar__logo-text">
            CareerForge <span className="navbar__logo-light">Pro</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="navbar__links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${isActive(link.to) ? 'navbar__link--active' : ''}`}
              id={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop Auth ── */}
        <div className="navbar__auth">
          {session ? (
            <>
              <div
                className="navbar__avatar"
                title={userProfile?.email}
                id="navbar-avatar"
              >
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="avatar"
                    className="navbar__avatar-img"
                  />
                ) : (
                  <span className="navbar__avatar-initials">
                    {getAvatarInitials()}
                  </span>
                )}
                <span className="navbar__avatar-ring" />
              </div>
              <button
                className="navbar__btn navbar__btn--logout"
                onClick={handleLogout}
                id="navbar-logout-btn"
              >
                <LogOut size={15} />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar__btn navbar__btn--ghost"
                id="navbar-login-btn"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="navbar__btn navbar__btn--primary"
                id="navbar-get-started-btn"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="navbar-mobile-toggle"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar__mobile-link ${isActive(link.to) ? 'navbar__link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}

        <div className="navbar__mobile-divider" />

        {session ? (
          <div className="navbar__mobile-auth">
            <div className="navbar__mobile-user">
              <div className="navbar__avatar navbar__avatar--lg">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="avatar"
                    className="navbar__avatar-img"
                  />
                ) : (
                  <span className="navbar__avatar-initials">
                    {getAvatarInitials()}
                  </span>
                )}
              </div>
              <span className="navbar__mobile-username">
                {userProfile?.user_metadata?.full_name ||
                  userProfile?.email ||
                  'User'}
              </span>
            </div>
            <button
              className="navbar__btn navbar__btn--logout navbar__btn--full"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        ) : (
          <div className="navbar__mobile-auth">
            <Link
              to="/login"
              className="navbar__btn navbar__btn--ghost navbar__btn--full"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="navbar__btn navbar__btn--primary navbar__btn--full"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
