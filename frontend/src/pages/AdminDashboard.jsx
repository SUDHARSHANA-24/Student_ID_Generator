import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import IDCard from '../components/IDCard';
import StudentForm from '../components/StudentForm';
import {
    Search, Eye, Filter, UserPlus, X, Download,
    CheckCircle, XCircle, Loader, Key, FileSpreadsheet,
    UploadCloud, Users, ChevronRight, Home, LayoutGrid, Upload
} from 'lucide-react';
import { useToast } from '../components/Toast';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPrintMode, setIsPrintMode] = useState(false);
    const [activeView, setActiveView] = useState('overview'); // 'overview', 'register', 'list', 'bulk'
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [stats, setStats] = useState({ Total: 0, Pending: 0, Approved: 0, Rejected: 0 });

    const { addToast } = useToast();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            // Use debouncedSearchTerm for API call
            const { data } = await axios.get(`/api/students?pageNumber=${page}&keyword=${debouncedSearchTerm}&status=${filterStatus}`, config);
            setStudents(data.students);
            setPages(data.pages);
            setTotal(data.total);
            if (data.stats) setStats(data.stats);
        } catch (error) {
            console.error(error);
        }
    };

    // Unified fetch effect
    useEffect(() => {
        if (userInfo) {
            fetchStudents();
        }
    }, [userInfo, page, filterStatus, debouncedSearchTerm]);

    // Debounce searchTerm change
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reset to page 1 for new search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const downloadPDF = (student) => {
        if (!student) return;

        // Use a slight delay to ensure the hidden element is updated if needed
        // but since we render it for the modal, it should be there.
        // Actually, we'll use the same hidden element strategy as StudentDashboard.
        const printableElement = document.getElementById('admin-id-card-printable');
        if (!printableElement) {
            addToast('Error: Printable element not found', 'error');
            return;
        }

        addToast('Generating PDF...', 'info');

        html2canvas(printableElement, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = 280;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`${student.registerNumber}_ID_Card.pdf`);
            addToast('ID Card downloaded successfully!', 'success');
        });
    };

    const handleVerify = async (id, status) => {
        setIsProcessing(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`/api/students/${id}/verify`, { status, rejectionReason }, config);
            addToast(`Student ${status} successfully`, 'success');
            fetchStudents();
            setShowModal(false);
            setRejectionReason('');
        } catch (error) {
            addToast(error.response?.data?.message || 'Verification failed', 'error');
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
                const fileData = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const ws = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert('Excel sheet is empty');
                    return;
                }

                // Function to find value by checking normalized keys and patterns
                const getValue = (item, patterns, defaultValue = "N/A", skipCount = 0) => {
                    const keys = Object.keys(item);
                    let foundCount = 0;
                    for (const pattern of patterns) {
                        const regex = new RegExp(pattern, 'i');
                        for (const key of keys) {
                            if (regex.test(key.trim())) {
                                if (foundCount === skipCount) {
                                    const value = item[key];
                                    if (value !== undefined && value !== null && String(value).trim() !== "") {
                                        return value;
                                    }
                                }
                                foundCount++;
                            }
                        }
                    }
                    return defaultValue;
                };

                const studentsData = data.map(item => ({
                    registerNumber: getValue(item, ['Reg.*No', 'Register.*Number'], ""),
                    name: getValue(item, ['Name', 'Student.*Name', 'Full.*Name'], ""),
                    department: getValue(item, ['Dept', 'Department', 'Branch'], ""),
                    year: getValue(item, ['Year', 'Batch'], ""),
                    email: getValue(item, ['Email', 'Mail.*ID'], ""),
                    officialEmail: getValue(item, ['Official.*Email', 'Institutional.*Email', 'Email'], "N/A"),
                    dob: getValue(item, ['DOB', 'Birth', 'Date.*of.*Bi', 'Date.*of.*Birth'], "N/A"),
                    bloodGroup: getValue(item, ['Blood', 'Group'], "N/A"),
                    gender: getValue(item, ['Gender', 'Sex'], "N/A"),
                    photoUrl: getValue(item, ['Photo', 'Image', 'Url'], ""),
                    address: getValue(item, ['Address', 'Place', 'Native', 'Location', 'City', 'Town'], "N/A"),
                    emergencyContact: getValue(item, ['Student.*Phone', 'Student.*Mob', 'Mobile', 'Phone', 'Personal.*Phone', 'Emergency.*Contact'], "N/A", 0),
                    parentPhone: getValue(item, ['Parent.*Phone', 'Parent.*Mob', 'Mobile', 'Phone', 'Father.*Mob', 'Father.*Phone'], "N/A", 1),
                    studentType: getValue(item, ['Student.*Type', 'Type', 'Scholar', 'Hostel', 'Day'], "Days Scholar"),
                    validUpto: getValue(item, ['Valid.*Upto', 'Validity', 'Expiry'], "N/A"),
                    templateType: getValue(item, ['Template', 'Card.*Type'], "4")
                }));

                console.log('Final Mapped Students Data:', studentsData);

                setIsProcessing(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data: response } = await axios.post('/api/students/bulk', { students: studentsData }, config);
                addToast(response.message, 'success');
                fetchStudents();
                setActiveView('overview');
            } catch (error) {
                console.error(error);
                addToast('Error processing file', 'error');
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const filteredStudents = students;

    const MenuCard = ({ title, icon: Icon, color, onClick, subtitle }) => (
        <button
            onClick={onClick}
            className={`${color} p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-slate-300 transition-all duration-500 transform hover:-translate-y-2 flex flex-col items-center justify-center text-white text-center group w-full relative overflow-hidden h-64 border border-white/10`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                <Icon size={160} />
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner relative z-10 border border-white/30">
                <Icon size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-black mb-1 relative z-10 drop-shadow-sm">{title}</h3>
            <p className="text-white/80 text-sm font-bold relative z-10">{subtitle}</p>
        </button>
    );

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-default">
            <div className={`${color} p-3.5 rounded-xl text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-gray-200/50`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">{title}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Print Mode View */}
            {isPrintMode && (
                <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8">
                    <div className="mb-8 flex justify-between items-center print:hidden border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Print View - Approved ID Cards</h2>
                            <p className="text-gray-500 text-sm">Use browser print (Ctrl+P) to print all cards. Page breaks are handled automatically.</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.print()}
                                className="bg-navy-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                            >
                                <Download size={20} /> Print Now
                            </button>
                            <button
                                onClick={() => setIsPrintMode(false)}
                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold border border-gray-200"
                            >
                                <X size={20} /> Exit Print View
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 justify-items-center">
                        {filteredStudents.map((student) => (
                            <div key={student._id} className="break-inside-avoid mb-8 pb-8 border-b border-gray-100 md:border-none">
                                <IDCard student={student} printable={true} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
                        className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-bold border border-gray-200 shadow-sm transition-all flex items-center gap-2 hover:shadow-md hover:-translate-x-1 active:scale-95"
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
                            value={stats.Total}
                            icon={Users}
                            color="bg-navy-800"
                        />
                        <StatCard
                            title="Pending"
                            value={stats.Pending}
                            icon={Loader}
                            color="bg-amber-500"
                        />
                        <StatCard
                            title="Approved"
                            value={stats.Approved}
                            icon={CheckCircle}
                            color="bg-green-600"
                        />
                        <StatCard
                            title="Rejected"
                            value={stats.Rejected}
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
                            color="bg-gradient-to-br from-crimson-600 to-crimson-800"
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
                            <span className="font-bold text-slate-700 text-[10px]">REGISTER NUMBER, NAME, EMAIL, DEPARTMENT, YEAR, DOB, BLOOD GROUP, GENDER, PHOTO URL, ADDRESS, STUDENT PHONE, PARENT PHONE, STUDENT TYPE</span>
                        </p>

                        <div className="flex flex-col gap-4 w-full">
                            <label className="w-full bg-navy-800 hover:bg-navy-900 text-white font-black py-5 rounded-[2rem] cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 border border-white/10 group">
                                <Upload className="w-6 h-6 group-hover:bounce" />
                                <span>SELECT EXCEL FILE</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    disabled={isProcessing}
                                />
                            </label>

                            <button
                                onClick={() => {
                                    const templateData = [
                                        {
                                            "Register Number": "7376232EC163",
                                            "Name": "PRABHANYA C",
                                            "Email": "prabhanya.ec23@bitsathy.ac.in",
                                            "Official Email": "prabhanya.ec25@bitsathy.ac.in",
                                            "Department": "ELECTRONICS AND COMMUNICATION ENGINEERING",
                                            "Year": "I",
                                            "DOB": "2007-07-12",
                                            "Blood Group": "B-ve",
                                            "Gender": "Female",
                                            "Address": "Erode",
                                            "Student Phone": "9876543213",
                                            "Parent Phone": "862432453",
                                            "Student Type": "Hosteller",
                                            "Photo URL": "uploads\\default-girl.png",
                                            "Valid Upto": "2023-2027"
                                        }
                                    ];
                                    const ws = XLSX.utils.json_to_sheet(templateData);
                                    const wb = XLSX.utils.book_new();
                                    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                                    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
                                }}
                                className="w-full bg-white text-navy-800 font-bold py-3 rounded-[1.5rem] border-2 border-dashed border-navy-200 hover:border-navy-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                DOWNLOAD SAMPLE TEMPLATE
                            </button>
                        </div>

                        <p className="mt-8 text-[11px] text-sky-600 bg-sky-50 p-4 rounded-2xl border border-sky-100 leading-relaxed max-w-sm">
                            <span className="font-bold uppercase block mb-1">📸 PHOTO TIP:</span> 
                            To make student photos appear, either use web links (like Cloudinary) 
                            or copy your photo files directly into the <strong>"backend/uploads"</strong> folder 
                            on your computer. We'll automatically find them by their filename!
                        </p>

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
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none hover:bg-white hover:border-gray-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Discontinued">Discontinued</option>
                            </select>
                            
                            {filterStatus === 'Approved' && (
                                <button
                                    onClick={() => setIsPrintMode(true)}
                                    className="bg-crimson-600 hover:bg-crimson-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                                >
                                    <FileSpreadsheet size={14} /> 
                                    Enter Print View (All IDs)
                                </button>
                            )}
                        </div>

                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or reg no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full transition-all hover:bg-white hover:border-gray-300 hover:shadow-sm"
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
                                        <tr key={student._id} className="hover:bg-blue-50/50 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-navy-800 group/row">
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
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:text-navy-600 hover:border-navy-200 hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all shadow-sm"
                                                >
                                                    <Eye size={14} className="group-hover/row:animate-pulse" /> View / Verify
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

                    {/* Pagination Controls */}
                    {pages > 1 && (
                        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <p className="text-sm font-bold text-gray-400">
                                Showing <span className="text-slate-900">{students.length}</span> of <span className="text-slate-900">{total}</span> records
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
                                >
                                    Previous
                                </button>
                                {[...Array(pages).keys()].map(x => (
                                    <button
                                        key={x + 1}
                                        onClick={() => setPage(x + 1)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all hover:scale-110 active:scale-90 ${page === x + 1 ? 'bg-navy-800 text-white shadow-lg' : 'bg-white text-slate-700 border border-gray-200 hover:border-navy-400 hover:shadow-md'}`}
                                    >
                                        {x + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                                    disabled={page === pages}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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

                                    {selectedStudent.proofUrl && (
                                        <div className="pt-4 border-t border-gray-200 mt-2">
                                            <a 
                                                href={selectedStudent.proofUrl.startsWith('http') ? selectedStudent.proofUrl : `/${selectedStudent.proofUrl.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <Eye size={16} /> VIEW SUPPORTING PROOF
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {selectedStudent.status && selectedStudent.status.toLowerCase() === 'pending' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleVerify(selectedStudent._id, 'Approved')}
                                                disabled={isProcessing}
                                                className="bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={20} /> Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!rejectionReason) {
                                                        addToast('Please provide a reason for rejection.', 'warning');
                                                        return;
                                                    }
                                                    handleVerify(selectedStudent._id, 'Rejected');
                                                }}
                                                disabled={isProcessing}
                                                className="bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
                                            <div className="pt-4 border-t border-blue-100/50 space-y-3">
                                                <button
                                                    onClick={() => downloadPDF(selectedStudent)}
                                                    className="w-full bg-navy-800 hover:bg-navy-900 text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                                                >
                                                    <Download size={18} /> Download ID Card
                                                </button>
                                                
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to mark this student as Discontinued? This will invalidate their ID card.')) {
                                                            handleVerify(selectedStudent._id, 'Discontinued');
                                                        }
                                                    }}
                                                    disabled={isProcessing}
                                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
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
            
            {/* Hidden Printable Component for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                {selectedStudent && <IDCard student={selectedStudent} printable={true} id="admin-id-card-printable" />}
            </div>
        </div>
    );
};

export default AdminDashboard;
