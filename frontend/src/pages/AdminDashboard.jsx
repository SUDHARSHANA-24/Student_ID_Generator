import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import IDCard from '../components/IDCard';
import StudentForm from '../components/StudentForm';
import {
    Search, Eye, Filter, UserPlus, X, Download,
    CheckCircle, XCircle, Loader, Key, FileSpreadsheet,
    UploadCloud, Users, ChevronRight, Home, LayoutGrid
} from 'lucide-react';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeView, setActiveView] = useState('overview'); // 'overview', 'register', 'list', 'bulk'

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('/api/students', config);
            setStudents(data.reverse());
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchStudents();
        }
    }, []);

    const handleVerify = async (id, status) => {
        setIsProcessing(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`/api/students/${id}/verify`, { status, rejectionReason }, config);
            fetchStudents();
            setShowModal(false);
            setRejectionReason('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert('Excel sheet is empty');
                    return;
                }

                // Standardize keys to match backend expectations
                const studentsData = data.map(item => ({
                    registerNumber: item['Register Number'] || item['regNo'] || item['RegisterNumber'],
                    name: item['Name'] || item['name'],
                    department: item['Department'] || item['dept'] || item['department'],
                    year: item['Year'] || item['year'],
                    email: item['Email'] || item['email']
                }));

                setIsProcessing(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data: response } = await axios.post('/api/students/bulk', { students: studentsData }, config);
                alert(response.message);
                fetchStudents();
                setActiveView('overview');
            } catch (error) {
                console.error(error);
                alert('Error processing file');
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const filteredStudents = students.filter(student => {
        // Only show students who have submitted for verification (Pending, Approved, Rejected)
        if (student.status === 'Registered') return false;

        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const MenuCard = ({ title, icon: Icon, color, onClick, subtitle }) => (
        <button
            onClick={onClick}
            className={`${color} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-white text-center group w-full relative overflow-hidden h-64`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Icon size={120} />
            </div>
            <div className="bg-white rounded-full p-6 mb-6 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                <Icon size={40} className="text-slate-800" />
            </div>
            <h3 className="text-2xl font-black mb-1 relative z-10">{title}</h3>
            <p className="text-white/80 text-sm font-bold relative z-10">{subtitle}</p>
        </button>
    );

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`${color} p-3 rounded-xl text-white`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Admin Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {activeView === 'overview' ? 'Dashboard' :
                            activeView === 'register' ? 'New Registration' :
                                activeView === 'list' ? 'Registered Students' : 'Bulk Sourcing'}
                    </h1>
                </div>
                {activeView !== 'overview' && (
                    <button
                        onClick={() => setActiveView('overview')}
                        className="bg-white hover:bg-gray-50 text-slate-700 px-6 py-2.5 rounded-xl font-bold border border-gray-200 shadow-sm transition-all flex items-center gap-2"
                    >
                        <LayoutGrid size={18} /> Back to Dashboard
                    </button>
                )}
            </div>

            {activeView === 'overview' && (
                <>
                    {/* Stat Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Students"
                            value={students.length}
                            icon={Users}
                            color="bg-blue-600"
                        />
                        <StatCard
                            title="Pending"
                            value={students.filter(s => s.status === 'Pending').length}
                            icon={Loader}
                            color="bg-amber-500"
                        />
                        <StatCard
                            title="Approved"
                            value={students.filter(s => s.status === 'Approved').length}
                            icon={CheckCircle}
                            color="bg-green-600"
                        />
                        <StatCard
                            title="Rejected"
                            value={students.filter(s => s.status === 'Rejected').length}
                            icon={XCircle}
                            color="bg-red-600"
                        />
                    </div>

                    {/* Main Menu Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MenuCard
                            title="New Student"
                            subtitle="Register Single ID"
                            icon={UserPlus}
                            color="bg-gradient-to-br from-indigo-500 to-purple-600"
                            onClick={() => setActiveView('register')}
                        />
                        <MenuCard
                            title="Records"
                            subtitle="Verify & Manage List"
                            icon={Users}
                            color="bg-gradient-to-br from-amber-400 to-orange-500"
                            onClick={() => setActiveView('list')}
                        />
                        <MenuCard
                            title="Bulk Import"
                            subtitle="Excel Spreadsheet Upload"
                            icon={FileSpreadsheet}
                            color="bg-gradient-to-br from-blue-400 to-blue-600"
                            onClick={() => setActiveView('bulk')}
                        />
                    </div>
                </>
            )}

            {activeView === 'register' && (
                <div className="max-w-2xl mx-auto">
                    <div className="card p-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <UserPlus className="text-blue-600" /> Single Student Registration
                        </h2>
                        <StudentForm onSuccess={() => {
                            fetchStudents();
                            setActiveView('overview');
                        }} />
                    </div>
                </div>
            )}

            {activeView === 'bulk' && (
                <div className="max-w-2xl mx-auto">
                    <div className="card p-12 text-center flex flex-col items-center">
                        <div className="bg-blue-50 p-8 rounded-full mb-8">
                            <UploadCloud size={80} className="text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Bulk Student Sourcing</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">
                            Upload an Excel file (.xlsx) with columns: <br />
                            <span className="font-bold text-slate-700">Register Number, Name, Department, Year, Email</span>
                        </p>

                        <label className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-3 shadow-xl">
                            <FileSpreadsheet />
                            {isProcessing ? 'Processing...' : 'Choose Excel File'}
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                disabled={isProcessing}
                            />
                        </label>

                        <p className="mt-6 text-xs text-gray-400">
                            * Duplicate registration numbers will be skipped automatically.
                        </p>
                    </div>
                </div>
            )}

            {activeView === 'list' && (
                <div className="card overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white">
                        <div className="flex items-center gap-6 w-full lg:w-auto">
                            <h2 className="text-2xl font-black text-slate-800">Records</h2>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Discontinued">Discontinued</option>
                            </select>
                        </div>

                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or reg no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Reg No.</th>
                                    <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                                    <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-6">
                                                <span className="font-black text-slate-900">{student.registerNumber}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-black text-slate-900">{student.name}</div>
                                                <div className="text-xs font-bold text-gray-400 uppercase">{student.department} • {student.year} Year</div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                                    ${student.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        student.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            student.status === 'Discontinued' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-amber-100 text-amber-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full 
                                                        ${student.status === 'Approved' ? 'bg-green-600' :
                                                            student.status === 'Rejected' ? 'bg-red-600' :
                                                                student.status === 'Discontinued' ? 'bg-gray-600' :
                                                                    'bg-amber-600'}`}></span>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-white transition-all shadow-sm"
                                                >
                                                    <Eye size={14} /> View / Verify
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Users size={40} className="text-gray-200 mb-4" />
                                                <p className="text-gray-400 font-bold">No student records found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View/Verify Modal (Existing Logic) */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl relative p-10 max-w-5xl w-full max-h-[95vh] overflow-y-auto animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
                            onClick={() => setShowModal(false)}
                        >
                            <X size={24} />
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Card Preview */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-xl font-black text-slate-900 mb-6 w-full text-center">ID Card Preview</h3>
                                <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <IDCard student={selectedStudent} />
                                </div>
                            </div>

                            {/* Verification Controls */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-2">Verification</h3>
                                    <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Review data accuracy</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                        <span className="text-xs text-gray-400 uppercase font-black tracking-widest">Reg No</span>
                                        <span className="text-sm font-black text-slate-900">{selectedStudent.registerNumber}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                        <span className="text-xs text-gray-400 uppercase font-black tracking-widest">Full Name</span>
                                        <span className="text-sm font-black text-slate-900">{selectedStudent.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-400 uppercase font-black tracking-widest">Status</span>
                                        <span className={`text-sm font-black ${selectedStudent.status === 'Approved' ? 'text-green-600' : selectedStudent.status === 'Rejected' ? 'text-red-600' : selectedStudent.status === 'Discontinued' ? 'text-gray-600' : 'text-amber-500'}`}>
                                            {selectedStudent.status}
                                        </span>
                                    </div>
                                </div>

                                {selectedStudent.status && selectedStudent.status.toLowerCase() === 'pending' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleVerify(selectedStudent._id, 'Approved')}
                                                disabled={isProcessing}
                                                className="bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={20} /> Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!rejectionReason) {
                                                        alert('Please provide a reason for rejection.');
                                                        return;
                                                    }
                                                    handleVerify(selectedStudent._id, 'Rejected');
                                                }}
                                                disabled={isProcessing}
                                                className="bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={20} /> Reject
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Rejection Note</label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Reason for rejection (required only for rejection)"
                                                className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                            ></textarea>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 text-center space-y-4">
                                        <div className="space-y-2">
                                            <CheckCircle size={40} className={`mx-auto ${selectedStudent.status === 'Approved' ? 'text-green-500' : selectedStudent.status === 'Rejected' ? 'text-red-500' : 'text-gray-500'}`} />
                                            <h4 className="font-black text-slate-800">Verification Complete</h4>
                                            <p className="text-xs font-bold text-gray-500 max-w-[200px] mx-auto">
                                                This student's ID has already been {selectedStudent.status.toLowerCase()}.
                                            </p>
                                        </div>

                                        {selectedStudent.status === 'Approved' && (
                                            <div className="pt-4 border-t border-blue-100/50">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to mark this student as Discontinued? This will invalidate their ID card.')) {
                                                            handleVerify(selectedStudent._id, 'Discontinued');
                                                        }
                                                    }}
                                                    disabled={isProcessing}
                                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                                                >
                                                    <XCircle size={14} /> Mark as Discontinued
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
