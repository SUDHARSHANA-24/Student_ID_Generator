import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { School, User, Lock, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { useToast } from '../components/Toast';

const CombinedLogin = () => {
    const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'student'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [registerNumber, setRegisterNumber] = useState('');
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/users/login', { username, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            addToast('Access Granted. Welcome back, Admin.', 'success');
            navigate('/admin-dashboard');
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid Admin Credentials', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/students/login', {
                registerNumber,
                name: studentName
            });
            localStorage.setItem('studentInfo', JSON.stringify(data));
            addToast('Login Successful. Welcome Student.', 'success');
            navigate('/student-dashboard');
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid Credentials', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/students/signup', {
                registerNumber,
                name: studentName,
                email: studentEmail,
                department,
                year
            });
            localStorage.setItem('studentInfo', JSON.stringify(data));
            addToast('Registration Successful! Please complete your profile.', 'success');
            navigate('/student-dashboard');
        } catch (error) {
            addToast(error.response?.data?.message || 'Registration Failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            {/* Brand Header */}
            <div className="mb-8 text-center animate-fade-in-up">
                <div className="inline-flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                        <School className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">EduID System</h1>
                </div>
                <p className="text-gray-500 font-medium">Secure Identity Management Portal</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up delay-100">
                {/* Tabs */}
                {!isRegistering && (
                    <div className="flex border-b border-gray-100">
                        <button
                            className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
                                ${activeTab === 'admin'
                                    ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => { setActiveTab('admin'); setUsername(''); setPassword(''); }}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Access
                        </button>
                        <button
                            className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
                                ${activeTab === 'student'
                                    ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => { setActiveTab('student'); setRegisterNumber(''); setStudentName(''); }}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student Portal
                        </button>
                    </div>
                )}

                {/* Form Content */}
                <div className="p-8">
                    {activeTab === 'admin' ? (
                        <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Admin Login</h2>
                                <p className="text-sm text-gray-400 mt-1">Enter your credentials to manage records</p>
                            </div>

                            <div>
                                <label className="label">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="Enter admin username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        className="input-field pl-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary mt-2"
                            >
                                {loading ? 'Authenticating...' : (
                                    <>
                                        Sign In Dashboard <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : isRegistering ? (
                        <form onSubmit={handleStudentRegister} className="space-y-4 animate-fade-in">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">Student Sign Up</h2>
                                <p className="text-sm text-gray-400 mt-1">Create an account to request your ID</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Register Number</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="REG2024001"
                                        value={registerNumber}
                                        onChange={(e) => setRegisterNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="John Doe"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="john@example.com"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Department</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="CSE"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Year</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="III"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary mt-2"
                            >
                                {loading ? 'Registering...' : 'Create Account'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="w-full text-sm text-blue-600 font-medium hover:underline"
                            >
                                Already have an account? Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleStudentLogin} className="space-y-5 animate-fade-in">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Student Login</h2>
                                <p className="text-sm text-gray-400 mt-1">View and download your digital ID card</p>
                            </div>

                            <div>
                                <label className="label">Register Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <School className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="e.g. REG2024001"
                                        value={registerNumber}
                                        onChange={(e) => setRegisterNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="John Doe"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary mt-2"
                            >
                                {loading ? 'Verifying...' : (
                                    <>
                                        Access Portal <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsRegistering(true)}
                                className="w-full text-sm text-blue-600 font-medium hover:underline"
                            >
                                Don't have an account? Register
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        &copy; 2024 Institute Management System. Secure Access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CombinedLogin;
