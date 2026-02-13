import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/users/login', {
                username,
                password,
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="glass w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-30"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-white mb-2">Welcome Back</h1>
                    <p className="text-white/70">Sign in to access the Admin Dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-white p-3 rounded-lg mb-6 flex items-center gap-2 backdrop-blur-sm">
                        <ShieldCheck className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-6 relative z-10">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-white/90 ml-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-white/50" />
                            </div>
                            <input
                                type="text"
                                className="input-field pl-10"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-white/90 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-white/50" />
                            </div>
                            <input
                                type="password"
                                className="input-field pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary flex justify-center items-center gap-2 group">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10">
                    <p className="text-white/60 text-sm">Are you a student?</p>
                    <Link to="/student-login" className="text-white font-medium hover:text-pink-200 transition-colors inline-flex items-center gap-1 mt-2">
                        Go to Student Login <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <p className="mt-6 text-white/40 text-sm">© 2026 Student ID Generator. All rights reserved.</p>
        </div>
    );
};

export default LoginPage;
