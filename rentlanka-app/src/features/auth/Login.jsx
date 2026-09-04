import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        const success = await login(data);
        if (success) navigate('/');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-slate-400">Sign in to your RentLanka account</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.password.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="btn-primary w-full flex justify-center items-center py-3"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-6 text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</Link>
                </p>
            </div>
        </div>
    );
};
