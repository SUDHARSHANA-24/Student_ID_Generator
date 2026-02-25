import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, Shield, BookOpen, GraduationCap, ExternalLink, Home, ChevronDown, ChevronUp, Clock, History } from 'lucide-react';

const VerificationPage = () => {
    const { registerNumber } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showMentorUnlock, setShowMentorUnlock] = useState(false);
    const [pinValue, setPinValue] = useState('');
    const [pinError, setPinError] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const { data } = await axios.get(`/api/students/verify/${registerNumber}`);
                setStudent(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Student not found');
                setLoading(false);
            }
        };
        fetchStudent();
    }, [registerNumber]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">Verifying Student ID...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h1>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold transition-all hover:bg-slate-800">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    const formattedPhotoUrl = student.photoUrl ? `/${student.photoUrl.replace(/\\/g, '/')}` : '';

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 selection:bg-blue-100 font-['Poppins']">
            {/* Success Banner */}
            <div className="w-full max-w-md bg-green-500 text-white p-4 rounded-t-2xl flex items-center justify-center gap-3 shadow-lg">
                <CheckCircle className="w-6 h-6" />
                <span className="font-black uppercase tracking-widest text-sm">Officially Verified</span>
            </div>

            <div className="w-full max-w-md bg-white rounded-b-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/10 w-16 h-16 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-white font-black text-xl tracking-tighter uppercase">Authentic Student ID</h1>
                        <p className="text-blue-300/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Digital Verification System</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Photo & Identity */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-50 p-1 shadow-inner">
                                <img
                                    src={formattedPhotoUrl || "https://via.placeholder.com/150"}
                                    alt={student.name}
                                    className="w-full h-full object-cover rounded-full shadow-md"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg border-4 border-white">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-center">
                            {student.name}
                        </h2>
                        <div className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-black uppercase tracking-wider">
                            {student.registerNumber}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mr-4 text-blue-600">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Department</p>
                                <p className="font-bold text-slate-900">{student.department}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mr-4 text-blue-600">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Academic Year</p>
                                <p className="font-bold text-slate-900">{student.year} Year</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mr-4 text-blue-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Status</p>
                                <div className="flex items-center justify-between">
                                    <p className={`font-black uppercase text-sm ${student.status === 'Approved' ? 'text-green-600' : student.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                                        {student.status}
                                    </p>
                                    {student.status === 'Approved' && <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>}
                                </div>
                            </div>
                        </div>

                        {/* Collapsible History Section */}
                        <div className="mt-2 border-t border-slate-100 pt-4">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">View Issuance Details</span>
                                </div>
                                {showHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>

                            {showHistory && (
                                <div className="mt-3 space-y-3 animate-fadeIn">
                                    <div className="p-4 bg-white rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            Verification Timeline
                                        </p>

                                        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-3 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-slate-100">
                                            {!showMentorUnlock ? (
                                                <div className="flex flex-col items-center py-6">
                                                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                        <Shield className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-500 text-center mb-4 leading-relaxed max-w-[200px]">
                                                        Audit logs are restricted to mentors.<br />Please enter your access code to reveal.
                                                    </p>
                                                    <div className="flex flex-col items-center gap-3">
                                                        <input
                                                            type="password"
                                                            maxLength="8"
                                                            placeholder="••••••••"
                                                            value={pinValue}
                                                            className={`w-36 px-3 py-2 bg-white border-2 rounded-xl text-center font-black tracking-widest text-slate-900 focus:outline-none transition-all text-sm shadow-sm
                                                                ${pinError ? 'border-red-400 focus:ring-4 focus:ring-red-50' : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                                                            onChange={(e) => {
                                                                const val = e.target.value.toUpperCase();
                                                                setPinValue(val);
                                                                setPinError(false);

                                                                const correctPin = student.registerNumber.slice(-8);
                                                                if (val === correctPin) {
                                                                    setShowMentorUnlock(true);
                                                                } else if (val.length === 8) {
                                                                    setPinError(true);
                                                                }
                                                            }}
                                                        />
                                                        {pinError && (
                                                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                                                                Wrong password
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                student.history && student.history.length > 0 ? (
                                                    [...student.history]
                                                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                                        .map((item, index) => (
                                                            <div key={index} className="relative flex items-start pl-8 group">
                                                                <div className={`absolute left-0 mt-1.5 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-colors
                                                                    ${item.status === 'Approved' ? 'bg-green-500' :
                                                                        item.status === 'Rejected' ? 'bg-red-500' :
                                                                            item.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-0.5">
                                                                        <p className={`text-[11px] font-black uppercase tracking-tight 
                                                                            ${item.status === 'Approved' ? 'text-green-600' :
                                                                                item.status === 'Rejected' ? 'text-red-600' :
                                                                                    item.status === 'Pending' ? 'text-amber-600' : 'text-blue-600'}`}>
                                                                            {item.status}
                                                                        </p>
                                                                        <span className="text-[10px] font-bold text-slate-400">
                                                                            {new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs font-bold text-slate-800 leading-tight mb-1">{item.message}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                                        By {item.updatedBy} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="relative flex items-start pl-8">
                                                        <div className="absolute left-0 mt-1.5 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-slate-400 flex items-center justify-center shadow-sm"></div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-slate-500 italic">No historical records available</p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                            <Shield className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Bannari Amman Institute of Technology</p>
                        </div>
                        <p className="text-[9px] text-slate-400">Record Created: {new Date(student.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ExternalLink className="w-3 h-3" />
                Scan QR code for authentic verification
            </p>
        </div>
    );
};

export default VerificationPage;
