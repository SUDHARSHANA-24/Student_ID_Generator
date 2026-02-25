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
    const [studentType, setStudentType] = useState('Days Scholar');
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
            if (studentEmail && !studentEmail.endsWith('@bitsathy.ac.in')) {
                addToast('Email must end with @bitsathy.ac.in', 'error');
                setLoading(false);
                return;
            }

            const { data } = await axios.post('/api/students/signup', {
                registerNumber,
                name: studentName,
                email: studentEmail,
                department,
                year,
                studentType
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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-200/20 rounded-full blur-[120px]"></div>

            {/* Brand Header */}
            <div className="mb-10 text-center animate-fade-in-up relative z-10">
                <div className="inline-flex items-center gap-4 mb-4">
                    <div className="p-4 bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-800">
                        <School className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">EduID System</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Student ID Generator</p>
                    </div>
                </div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-lg glass-card overflow-hidden animate-fade-in-up delay-100 relative z-10">
                {/* Tabs */}
                {!isRegistering && (
                    <div className="flex bg-slate-900/5 p-1.5 m-6 rounded-2xl">
                        <button
                            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 rounded-xl
                                ${activeTab === 'admin'
                                    ? 'text-white bg-slate-900 shadow-xl'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            onClick={() => { setActiveTab('admin'); setUsername(''); setPassword(''); }}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Admin
                        </button>
                        <button
                            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 rounded-xl
                                ${activeTab === 'student'
                                    ? 'text-white bg-slate-900 shadow-xl'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            onClick={() => { setActiveTab('student'); setRegisterNumber(''); setStudentName(''); }}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student
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
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-12"
                                        placeholder="Admin username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        className="input-field pl-12"
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
                                        value={registerNumber}
                                        onChange={(e) => setRegisterNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Official Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Department</label>
                                <select
                                    className="input-field"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Computer Science Engineering"> Computer Science Engineering</option>
                                    <option value="Computer Science and Business Systems"> Computer Science and Business Systems</option>
                                    <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                                    <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                                    <option value="Computer Technology">Computer Technology</option>
                                    <option value="Computer Science and Design">Computer Science and Design</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Year</label>
                                    <select
                                        className="input-field"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        <option value="I">I</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                        <option value="IV">IV</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Student Type</label>
                                    <select
                                        className="input-field"
                                        value={studentType}
                                        onChange={(e) => setStudentType(e.target.value)}
                                        required
                                    >
                                        <option value="Days Scholar">Days Scholar</option>
                                        <option value="Hosteller">Hosteller</option>
                                    </select>
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
                                className="w-full text-xs text-slate-500 font-black uppercase tracking-widest hover:text-indigo-600 transition-colors text-center"
                            >
                                Login with existing account <span className="text-10">↗</span>
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
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <School className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-12"
                                        placeholder="737622XXXX"
                                        value={registerNumber}
                                        onChange={(e) => setRegisterNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-12"
                                        placeholder="JOHN DOE"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary mt-4"
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
