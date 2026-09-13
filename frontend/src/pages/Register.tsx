import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/cn';
import './Register.css';

interface RegisterFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register: registerAuth, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerAuth({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: 'customer'
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch {
      // Error handled by hook state
    }
  };

  return (
    <div className="register-root">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="register-card"
      >
        <AnimatePresence>
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="register-success-overlay"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="register-success-icon-wrap"
              >
                <CheckCircle2 className="w-8 h-8 text-[var(--kb-green)]" />
              </motion.div>
              <h3 className="register-success-title">Pendaftaran Manifes Berhasil</h3>
              <p className="register-success-desc">Mengarahkan ke halaman masuk akun...</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="register-header">
          <div className="register-logo-box">
            <Package className="w-6 h-6 text-[var(--kb-asphalt)]" strokeWidth={2.5} />
          </div>
          <h2 className="register-title">Daftar Akun Kargo</h2>
        </div>

        {error && (
          <div className="register-error-box">
            <AlertCircle className="w-5 h-5 text-[var(--kb-red)] shrink-0 mt-0.5" />
            <p className="register-error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div>
            <label className="register-label">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="John Doe"
              {...register('fullName', { required: 'Nama lengkap wajib diisi' })}
              className={cn(
                "apple-input w-full",
                errors.fullName && "border-[var(--kb-red)] focus:ring-[var(--kb-red)]"
              )}
            />
            {errors.fullName && (
              <p className="register-error-msg">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="register-label">
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
              <p className="register-error-msg">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="register-label">
              Nomor Telepon
            </label>
            <input
              type="tel"
              placeholder="081234567890"
              {...register('phoneNumber', { 
                required: 'Nomor telepon wajib diisi',
                pattern: {
                  value: /^(08|\+62)\d{8,13}$/,
                  message: 'Format nomor telepon tidak valid'
                }
              })}
              className={cn(
                "apple-input w-full",
                errors.phoneNumber && "border-[var(--kb-red)] focus:ring-[var(--kb-red)]"
              )}
            />
            {errors.phoneNumber && (
              <p className="register-error-msg">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="register-password-grid">
            <div>
              <label className="register-label">
                Password
              </label>
              <div className="register-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password wajib diisi',
                    minLength: { value: 6, message: 'Minimal 6 karakter' }
                  })}
                  className={cn(
                    "apple-input w-full pr-10",
                    errors.password && "border-[var(--kb-red)] focus:ring-[var(--kb-red)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="register-password-toggle"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="register-error-msg">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="register-label">
                Konfirmasi
              </label>
              <div className="register-password-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword', { 
                    required: 'Konfirmasi password wajib diisi',
                    validate: value => value === password || 'Password tidak cocok'
                  })}
                  className={cn(
                    "apple-input w-full pr-10",
                    errors.confirmPassword && "border-[var(--kb-red)] focus:ring-[var(--kb-red)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="register-password-toggle"
                  aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="register-error-msg">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="neo-btn register-submit-btn"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-white" />}
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="register-footer">
          <span className="register-footer-text">Sudah punya akun? </span>
          <Link to="/login" className="register-link">
            Masuk
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
