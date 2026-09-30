import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Package, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './Header.css'

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/booking', label: 'Kirim Kargo' },
  { to: '/tracking', label: 'Lacak Resi' },
  { to: '/admin', label: 'Operasional' },
  { to: '/driver', label: 'Portal Driver' },
  { to: '/faq', label: 'FAQ' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header className="header-root">
        <div className="header-hazard-strip hazard-stripes-slim" />
        <nav className="header-nav">
          {/* Logo & Freight Tag */}
          <Link to="/" className="header-logo group">
            <div className="header-logo-crate-icon">
              <Package className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex items-center">
              <span className="header-logo-title">
                KurBhan
              </span>
              <span className="header-logo-tag">CARGO</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="header-desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`header-nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="header-desktop-auth">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`header-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  {user?.fullName?.split(' ')[0] || 'Dashboard'}
                </Link>
                <button
                  onClick={logout}
                  className="header-btn-logout"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="header-link-login"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="header-btn-register"
                >
                  Daftar Kargo
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="header-mobile-toggle"
            aria-label="Buka menu navigasi"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="header-mobile-overlay"
          >
            <div className="header-mobile-menu">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`header-mobile-link ${isActive(link.to) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="header-mobile-divider" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="header-mobile-link"
                  >
                    Dashboard Manifes Saya
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false) }}
                    className="header-mobile-link text-[var(--kb-hazard)] text-left bg-transparent border-none cursor-pointer"
                  >
                    Keluar dari Akun
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="header-mobile-link"
                  >
                    Masuk Akun
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="hazard-btn w-full mt-2"
                  >
                    Daftar Kargo Sekarang
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
