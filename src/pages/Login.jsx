import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiArrowLeft } from 'react-icons/fi';
import { useLoginMutation } from '@/redux/api/apiSlice';
import { setCredentials, selectCurrentUser } from '@/redux/features/authSlice';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [login, { isLoading }] = useLoginMutation();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const response = await login(values).unwrap();
      const { user, accessToken } = response.data;
      dispatch(setCredentials({ user, accessToken }));
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Left split hero panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-teal-950 via-slate-950 to-slate-900 text-white relative overflow-hidden border-r border-slate-800">
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Public Portfolio
          </Link>
          <div className="mt-20">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/20">
              Admin Gateway
            </span>
            <h1 className="text-4xl font-extrabold mt-4 tracking-tight leading-tight">
              Dynamic Portfolio Management Control Center
            </h1>
            <p className="mt-4 text-sm text-slate-300 max-w-md leading-relaxed">
              Authenticate to manage projects, technical proficiencies, career timelines, and review incoming contact inquiries directly.
            </p>
          </div>
        </div>

        {/* <div className="relative z-10 text-xs text-teal-400/80">
          Seed credentials: admin@portfolio.com / Admin@123
        </div> */}

        {/* Decorative blur blob */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Admin Login
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your administrative credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={FiLock}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
