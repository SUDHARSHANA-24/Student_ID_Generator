import { useState } from 'react';
import axios from 'axios';
import { Upload, Plus, Save, User, Calendar, MapPin, Phone, CreditCard } from 'lucide-react';
import { useToast } from './Toast';

const StudentForm = ({ onSuccess, existingStudent, isStudentView }) => {
    const [formData, setFormData] = useState({
        name: existingStudent?.name || '',
        registerNumber: existingStudent?.registerNumber || '',
        department: existingStudent?.department || '',
        year: existingStudent?.year || '',
        dob: existingStudent?.dob ? new Date(existingStudent.dob).toISOString().split('T')[0] : '',
        bloodGroup: existingStudent?.bloodGroup || '',
        gender: existingStudent?.gender || 'Male',
        address: existingStudent?.address || '',
        emergencyContact: existingStudent?.emergencyContact || '',
        parentPhone: existingStudent?.parentPhone || '',
        officialEmail: existingStudent?.officialEmail || '',
        validUpto: existingStudent?.validUpto || '',
        studentType: existingStudent?.studentType || 'Days Scholar'
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const userInfo = JSON.parse(localStorage.getItem(isStudentView ? 'studentInfo' : 'userInfo'));

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (photo) {
            data.append('photo', photo);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            if (isStudentView) {
                // Student updating their own profile
                await axios.put('/api/students/profile', data, config);
                addToast('Profile updated successfully.', 'success');
            } else if (existingStudent) {
                // Admin updating a student (if we decide to allow this later)
                await axios.put(`/api/students/${existingStudent._id}`, data, config);
                addToast('Student details updated.', 'success');
            } else {
                // Admin creating a new student
                await axios.post('/api/students', data, config);
                addToast('Student registration successful.', 'success');
                setFormData({
                    name: '',
                    registerNumber: '',
                    department: '',
                    year: '',
                    dob: '',
                    bloodGroup: '',
                    gender: 'Male',
                    address: '',
                    emergencyContact: '',
                    parentPhone: '',
                    officialEmail: '',
                    validUpto: '',
                    studentType: 'Days Scholar'
                });
                setPhoto(null);
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            addToast(error.response?.data?.message || 'Action failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`card p-6 h-full ${isStudentView ? 'shadow-sm border-gray-100 max-w-2xl mx-auto' : ''}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                    {isStudentView ? <User className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        {isStudentView ? 'Complete Your Profile' : 'New Registration'}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {isStudentView ? 'Please provide accurate details for your ID card' : 'Enter student details to generate ID'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Information Group */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-xs">Personal Information</h3>

                    <div className="space-y-4">
                        <label className="label">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`input-field pl-10 ${isStudentView ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                required
                                readOnly={isStudentView}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Register No.</label>
                            <input
                                type="text"
                                name="registerNumber"
                                placeholder="REG2024..."
                                value={formData.registerNumber}
                                onChange={handleInputChange}
                                className={`input-field ${isStudentView ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                required
                                readOnly={isStudentView}
                            />
                        </div>
                        <div>
                            <label className="label">Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="CSE"
                                value={formData.department}
                                onChange={handleInputChange}
                                className={`input-field ${isStudentView ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                required
                                readOnly={isStudentView}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Year</label>
                            <input
                                type="text"
                                name="year"
                                placeholder="IV"
                                value={formData.year}
                                onChange={handleInputChange}
                                className={`input-field ${isStudentView ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                required
                                readOnly={isStudentView}
                            />
                        </div>
                        <div>
                            <label className="label">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="input-field">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="label">Blood Group</label>
                            <input type="text" name="bloodGroup" placeholder="B+" value={formData.bloodGroup} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="label">Student Type</label>
                        <select
                            name="studentType"
                            value={formData.studentType}
                            onChange={handleInputChange}
                            className="input-field"
                        >
                            <option value="Days Scholar">Days Scholar (Template 1)</option>
                            <option value="Hosteller">Hosteller (Template 2)</option>
                        </select>
                        <p className="text-[10px] text-gray-400 font-medium italic">
                            * Template will be automatically selected based on student type.
                        </p>
                    </div>
                </div>

                {/* Contact Information Group */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-xs border-t pt-4">Contact Details</h3>

                    <div>
                        <label className="label">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input type="text" name="address" placeholder="123 Main St, City" value={formData.address} onChange={handleInputChange} className="input-field pl-10" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Emergency Contact</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input type="text" name="emergencyContact" placeholder="9876543210" value={formData.emergencyContact} onChange={handleInputChange} className="input-field pl-10" required />
                            </div>
                        </div>
                        <div>
                            <label className="label">Parent Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input type="text" name="parentPhone" placeholder="9876543210" value={formData.parentPhone} onChange={handleInputChange} className="input-field pl-10" required />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Official E-mail</label>
                            <input type="email" name="officialEmail" placeholder="student@bitsathy.ac.in" value={formData.officialEmail} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="label">Valid Upto</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input type="text" name="validUpto" placeholder="YYYY-MM-DD" value={formData.validUpto} onChange={handleInputChange} className="input-field pl-10" required />
                            </div>
                        </div>
                    </div>
                </div>



                <div>
                    <label className="label">Student Photo</label>
                    <div className="relative mt-1">
                        <input type="file" id="photo-upload" onChange={handleFileChange} className="hidden" />
                        <label htmlFor="photo-upload" className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-sm text-gray-600">{photo ? photo.name : "Click to upload photo"}</span>
                            <span className="text-xs text-gray-400">JPG, PNG (Max 2MB)</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed py-3 text-base">
                        {loading ? 'Processing...' : (
                            <>
                                <Save className="w-5 h-5" />
                                {isStudentView ? 'Submit for Admin Verification' : 'Generate & Save ID'}
                            </>
                        )}
                    </button>
                    {isStudentView && (
                        <p className="mt-3 text-center text-xs text-gray-400">
                            * Your ID card will be available for download once the admin verifies these details.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
