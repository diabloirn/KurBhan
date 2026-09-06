import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/cn';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <Package className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Atau{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            daftar jika belum punya akun
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md relative">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button type="button" onClick={clearError} className="ml-auto text-red-400 hover:text-red-500">
                    &times;
                </button>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={cn(
                    "focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border",
                    errors.email && "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                  )}
                  placeholder="anda@email.com"
                  {...register("email", { 
                    required: "Email wajib diisi",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Format email tidak valid"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Kata Sandi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={cn(
                    "focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-slate-300 rounded-md py-2 border",
                    errors.password && "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                  )}
                  placeholder="••••••••"
                  {...register("password", { 
                    required: "Kata sandi wajib diisi",
                    minLength: {
                      value: 6,
                      message: "Kata sandi minimal 6 karakter"
                    }
                  })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-500 focus:outline-none focus:text-indigo-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message as string}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Lupa kata sandi?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
