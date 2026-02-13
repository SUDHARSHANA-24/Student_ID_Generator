import { useState, useEffect } from 'react';
import axios from 'axios';
import IDCard from '../components/IDCard';
import StudentForm from '../components/StudentForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Loader, Info, Edit3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const { addToast } = useToast();
    const userInfo = JSON.parse(localStorage.getItem('studentInfo'));

    const fetchProfile = async () => {
        if (!userInfo) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('/api/students/profile', config);
            setStudent(data);
            // If new registration or rejected, show the form
            if (data.status === 'Registered' || data.status === 'Rejected') {
                setShowEditForm(true);
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to fetch profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const downloadPDF = () => {
        const cardElement = document.getElementById('id-card');
        if (!cardElement) return;

        const originalTransform = cardElement.style.transform;
        cardElement.style.transform = 'none';

        html2canvas(cardElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            logging: false
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = 200;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`${student.registerNumber}_ID.pdf`);
            cardElement.style.transform = originalTransform;
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-800">
                <Loader className="w-10 h-10 animate-spin mb-4 text-blue-600" />
                <p className="text-lg font-medium">Loading Profile...</p>
            </div>
        );
    }

    if (!student) return <div className="text-center mt-10 text-gray-600">Student profile not available.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900">Student Portal</h1>
                    <p className="text-gray-500">Welcome back, <span className="font-semibold text-slate-800">{student.name}</span></p>
                </div>

                <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm border
                    ${student.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                        student.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'}`}
                >
                    {student.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> :
                        student.status === 'Rejected' ? <XCircle className="w-4 h-4" /> :
                            <Clock className="w-4 h-4" />}
                    Status: {student.status}
                </div>
            </div>

            {student.status === 'Rejected' && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-800">Reason for Rejection:</h4>
                        <p className="text-red-700">{student.rejectionReason || 'Please check your details and try again.'}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Completion Section */}
                <div className="lg:col-span-3 space-y-6">
                    {student.status === 'Pending' ? (
                        <div className="card p-12 text-center space-y-4 shadow-sm border-amber-100 bg-amber-50/20">
                            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Verification in Progress</h3>
                                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                    Your profile has been submitted and is currently under review by the administration.
                                    Please check back later to download your digital ID.
                                </p>
                            </div>
                        </div>
                    ) : !showEditForm ? (
                        <div className="card p-6 flex items-center justify-between shadow-sm border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Profile Information</h3>
                                <p className="text-gray-500 text-sm">Keep your details up to date for your ID card.</p>
                            </div>
                            <button
                                onClick={() => setShowEditForm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all hover:border-gray-300 shadow-sm"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-w-2xl mx-auto flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 font-heading">Complete Your Profile</h3>
                                    <p className="text-sm text-gray-500">Provide your information to generate your digital ID card.</p>
                                </div>
                                {student.status !== 'Registered' && (
                                    <button
                                        onClick={() => setShowEditForm(false)}
                                        className="text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-100 px-3 py-1 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                            <div className="animate-fade-in">
                                <StudentForm
                                    existingStudent={student}
                                    isStudentView={true}
                                    onSuccess={() => {
                                        setShowEditForm(false);
                                        fetchProfile();
                                        addToast('Profile submitted for verification.', 'success');
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {student.status === 'Approved' && !showEditForm && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">Your Digital ID Card</h2>
                                <p className="text-gray-500 text-sm">Review your details below.</p>
                            </div>
                            <div className="flex justify-center mb-8">
                                <IDCard student={student} />
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={downloadPDF}
                                    className="btn-primary px-8 py-3 rounded-full flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {student.status === 'Pending' && !showEditForm && (
                        <div className="card p-12 text-center bg-gray-50 animate-pulse">
                            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Awaiting Approval</h3>
                            <p className="text-gray-500">Your details have been submitted. The admin will verify them shortly.</p>
                        </div>
                    )}
                </div>

                {/* Info and Tips */}
                {!showEditForm && (
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <Info className="w-6 h-6 text-blue-600 mb-3" />
                            <h4 className="font-bold text-blue-800 mb-2">Getting Started</h4>
                            <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
                                <li>Ensure your photo is clear and professional.</li>
                                <li>The admin will verify your details before generation.</li>
                                <li>Once approved, you can download your PDF.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
