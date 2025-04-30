import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { EyeCloseLine } from '../components/EyeCloseLine';
import { loginSchema } from '../validations/auth.schema';
import { authService } from '../services/auth.service';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authService.login(data.email, data.password);
      toast.success('Login successful!', {
        duration: 3000, // 3 seconds
      });
      // Redirect to menu page instead of root
      navigate('/menu');
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background font-roboto flex flex-col">
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Text */}
        <div className="text-center mt-[80px]">
          <h1 className="text-[28px] font-medium text-primary">Welcome Back!</h1>
          <p className="text-[13px] font-medium text-primary mt-2">Please Login to your account</p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[410px] px-8 mx-auto mt-[80px]">
          {/* Input Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-[490px]">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email..."
                  {...register('email')}
                  className="w-full h-[52px] bg-white border border-primary rounded-[20px] px-5 text-[16px] font-medium text-primary placeholder-primary focus:outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password..."
                  {...register('password')}
                  className="w-full h-[52px] bg-white border border-primary rounded-[20px] px-5 text-[16px] font-medium text-primary placeholder-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2"
                >
                  <EyeCloseLine className="w-5 h-5 text-primary" />
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Login Button */}
            <div className="flex-1 flex items-end justify-center mb-20">
              <button
                type="submit"
                disabled={isLoading}
                className="w-[221px] h-[52px] bg-primary text-background rounded-[20px] text-[16px] font-thin disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'LOGIN'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center mb-8">
        <p className="text-[12px] text-primary">
          <span>Don't have an account? </span>
          <span 
            className="font-bold cursor-pointer" 
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
