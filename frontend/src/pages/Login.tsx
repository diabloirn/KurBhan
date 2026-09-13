import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/cn';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data.email, data.password);
  };

  return (
    <div className="login-root">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="login-card"
      >
        <div className="login-header">
          <div className="login-logo-box">
            <Package className="w-6 h-6 text-[var(--kb-asphalt)]" strokeWidth={2.5} />
          </div>
          <h2 className="login-title">Masuk Portal Pengirim</h2>
        </div>

        {error && (
          <div className="login-error-box">
            <AlertCircle className="w-5 h-5 text-[var(--kb-red)] shrink-0 mt-0.5" />
            <p className="login-error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div>
            <label className="login-label">
              Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              {...register('email', { required: 'Email wajib diisi' })}
              className={cn(
                "apple-input w-full",
                errors.email && "border-[var(--kb-red)] focus:ring-[var(--kb-red)]"
              )}
            />
            {errors.email && (
              <p className="login-error-msg">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="login-label">
              Password
            </label>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { required: 'Password wajib diisi' })}
                className={cn(
                  "apple-input w-full pr-12",
                  errors.password && "border-[var(--kb-red)] focus:ring-[var(--kb-red)]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="login-error-msg">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="neo-btn-blue login-submit-btn"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-footer-text">Belum punya akun? </span>
          <Link to="/register" className="login-link">
            Daftar
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
