import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Min 6 chars'),
    confirm: z.string(),
    phone: z.string().min(10, 'Invalid phone number'),
    role: z.enum(['CUSTOMER', 'OWNER'])
}).refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
});

export const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { role: 'CUSTOMER' }
    });

    const onSubmit = async (data) => {
        const { confirm, ...payload } = data;
        const success = await registerUser(payload);
        if (success) navigate('/login');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Create an account</h2>
                    <p className="mt-2 text-slate-400">Join RentLanka to rent or list vehicles</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                <input {...register('name')} className="input-field" placeholder="John Doe" />
                                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                                <input {...register('phone')} className="input-field" placeholder="0771234567" />
                                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
                                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                                <input {...register('confirm')} type="password" className="input-field" placeholder="••••••••" />
                                {errors.confirm && <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">I want to...</label>
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input type="radio" value="CUSTOMER" {...register('role')} className="peer sr-only" />
                                    <div className="text-center p-3 rounded-lg border border-slate-700 bg-slate-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:text-indigo-400 text-slate-400 transition-all font-medium">
                                        Rent Vehicles
                                    </div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input type="radio" value="OWNER" {...register('role')} className="peer sr-only" />
                                    <div className="text-center p-3 rounded-lg border border-slate-700 bg-slate-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:text-indigo-400 text-slate-400 transition-all font-medium">
                                        List Vehicles
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-4">
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-6 text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
};
