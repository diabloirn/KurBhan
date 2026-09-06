import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Package, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'
import { cn } from '../lib/cn'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/booking', label: 'Kirim Paket' },
    { to: '/tracking', label: 'Lacak Kiriman' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Package className="h-5 w-5" />
          </div>
          <span>Kur<span className="text-indigo-600">Bhan</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-3 pr-1.5">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{user?.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                  title="Keluar"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          'overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 md:hidden',
          mobileOpen ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <nav className="space-y-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-slate-200" />
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

