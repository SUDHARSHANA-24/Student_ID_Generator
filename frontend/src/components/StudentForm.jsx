import { useState, useEffect } from 'react';
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
        gender: existingStudent?.gender || '',
        address: existingStudent?.address || '',
        emergencyContact: existingStudent?.emergencyContact ? existingStudent.emergencyContact.replace(/^\+91/, '') : '',
        parentPhone: existingStudent?.parentPhone ? existingStudent.parentPhone.replace(/^\+91/, '') : '',
        officialEmail: existingStudent?.officialEmail || existingStudent?.email || '',
        validUpto: existingStudent?.validUpto || '',
        studentType: existingStudent?.studentType || ''
    });
    const [photo, setPhoto] = useState(null);
    const [aadhaarProof, setAadhaarProof] = useState(null);
    const [birthCertProof, setBirthCertProof] = useState(null);
    const [admissionProof, setAdmissionProof] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const { addToast } = useToast();

    const userInfo = JSON.parse(localStorage.getItem(isStudentView ? 'studentInfo' : 'userInfo'));

    // Only populate form from existingStudent once to prevent edits from being wiped
    useEffect(() => {
        if (existingStudent && !isInitialized) {
            setFormData({
                name: existingStudent.name || '',
                registerNumber: existingStudent.registerNumber || '',
                department: existingStudent.department || '',
                year: existingStudent.year || '',
                dob: existingStudent.dob ? new Date(existingStudent.dob).toISOString().split('T')[0] : '',
                bloodGroup: existingStudent.bloodGroup || '',
                gender: existingStudent.gender || '',
                address: existingStudent.address || '',
                emergencyContact: existingStudent.emergencyContact ? existingStudent.emergencyContact.replace(/^\+91/, '') : '',
                parentPhone: existingStudent.parentPhone ? existingStudent.parentPhone.replace(/^\+91/, '') : '',
                officialEmail: existingStudent.officialEmail || existingStudent.email || '',
                validUpto: existingStudent.validUpto || '',
                studentType: existingStudent.studentType || ''
            });
            setIsInitialized(true);
        }
    }, [existingStudent, isInitialized]);
    
    // Helper to check if a field has been modified from initial value
    const isModified = (field) => {
        if (!existingStudent) return false;
        
        let initialValue = existingStudent[field] || '';
        let currentValue = formData[field] || '';

        if (field === 'dob') {
            initialValue = initialValue ? new Date(initialValue).toISOString().split('T')[0] : '';
        } else if (field === 'emergencyContact' || field === 'parentPhone') {
            initialValue = initialValue.replace(/^\+91/, '');
        }
        
        return String(initialValue).trim().toUpperCase() !== String(currentValue).trim().toUpperCase();
    };

    const needsAadhaar = isModified('name') || isModified('address');
    const needsBirthCert = isModified('dob');
    const needsAdmissionReceipt = isModified('registerNumber') || isModified('department') || isModified('studentType') || isModified('emergencyContact');

    const handleInputChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'registerNumber') {
            value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        } else if (e.target.name === 'name') {
            value = value.toUpperCase();
        } else if (e.target.name === 'emergencyContact' || e.target.name === 'parentPhone') {
            // Only allow 10 digits
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (e.target.name === 'aadhaarProof') setAadhaarProof(file);
        else if (e.target.name === 'birthCertProof') setBirthCertProof(file);
        else if (e.target.name === 'admissionProof') setAdmissionProof(file);
        else setPhoto(file);
    };

    const isRealPhoto = (url) => {
        if (!url || typeof url !== 'string') return false;
        const normalized = url.toLowerCase().trim();
        // Check for common falsy strings or placeholders
        if (['', 'undefined', 'null', 'none', 'placeholder'].includes(normalized)) return false;
        // Must contain 'http' (Cloudinary) or 'uploads/' (Local)
        // AND must not contain 'default'
        const hasValidPrefix = normalized.startsWith('http') || normalized.startsWith('uploads') || normalized.includes('/uploads/');
        const isNotDefault = !normalized.includes('default');
        return hasValidPrefix && isNotDefault;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.name || !formData.registerNumber || !formData.department || !formData.year || !formData.dob || !formData.bloodGroup || !formData.address || !formData.emergencyContact || !formData.parentPhone || !formData.officialEmail) {
            addToast('Please fill in all required fields.', 'error');
            setLoading(false);
            return;
        }

        // Photo check: strictly required if no photo is currently uploaded AND no real photo exists in profile
        if (!photo && !isRealPhoto(existingStudent?.photoUrl)) {
            addToast('Please upload a student photo.', 'error');
            setLoading(false);
            return;
        }

        if (formData.officialEmail && !formData.officialEmail.endsWith('@bitsathy.ac.in')) {
            addToast('Official Email must end with @bitsathy.ac.in', 'error');
            setLoading(false);
            return;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.emergencyContact)) {
            addToast('Student Phone must be exactly 10 digits starting with 6, 7, 8, or 9.', 'error');
            setLoading(false);
            return;
        }
        if (!phoneRegex.test(formData.parentPhone)) {
            addToast('Parent Phone must be exactly 10 digits starting with 6, 7, 8, or 9.', 'error');
            setLoading(false);
            return;
        }

        const yearToValidUpto = {
            'I': '2025-2029',
            'II': '2024-2028',
            'III': '2023-2027',
            'IV': '2022-2026'
        };

        const data = new FormData();
        for (const key in formData) {
            if (key === 'validUpto') {
                data.append(key, yearToValidUpto[formData.year] || formData.validUpto);
            } else if (key === 'emergencyContact' || key === 'parentPhone') {
                data.append(key, formData[key] ? '+91' + formData[key] : '');
            } else {
                data.append(key, formData[key]);
            }
        }
        if (photo) {
            data.append('photo', photo);
        }
        if (aadhaarProof) data.append('aadhaarProof', aadhaarProof);
        if (birthCertProof) data.append('birthCertProof', birthCertProof);
        if (admissionProof) data.append('admissionProof', admissionProof);

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
                    gender: '',
                    address: '',
                    emergencyContact: '',
                    parentPhone: '',
                    officialEmail: '',
                    validUpto: '',
                    studentType: 'Days Scholar'
                });
                setPhoto(null);
                setAadhaarProof(null);
                setBirthCertProof(null);
                setAdmissionProof(null);
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

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

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
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Register No.</label>
                            <input
                                type="text"
                                name="registerNumber"
                                value={formData.registerNumber}
                                onChange={handleInputChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select Department</option>
                                <option value="COMPUTER SCIENCE ENGINEERING">COMPUTER SCIENCE ENGINEERING</option>
                                <option value="COMPUTER SCIENCE AND BUSINESS SYSTEMS">COMPUTER SCIENCE AND BUSINESS SYSTEMS</option>
                                <option value="ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING">ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING</option>
                                <option value="ARTIFICIAL INTELLIGENCE AND DATA SCIENCE">ARTIFICIAL INTELLIGENCE AND DATA SCIENCE</option>
                                <option value="COMPUTER TECHNOLOGY">COMPUTER TECHNOLOGY</option>
                                <option value="COMPUTER SCIENCE AND DESIGN">COMPUTER SCIENCE AND DESIGN</option>
                                <option value="ELECTRONICS AND COMMUNICATION ENGINEERING">ELECTRONICS AND COMMUNICATION ENGINEERING</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Year</label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className="input-field"
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
                            <label className="label">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="input-field" required>
                                <option value="">Select Gender</option>
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
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="input-field" required>
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="label">Student Type</label>
                        <select
                            name="studentType"
                            value={formData.studentType}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        >
                            <option value="">Select Student Type</option>
                            <option value="Days Scholar">Days Scholar</option>
                            <option value="Hosteller">Hosteller</option>
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
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-field pl-10" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Student Phone</label>
                            <div className="flex items-center gap-1">
                                <span className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-500 font-bold text-sm">+91</span>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleInputChange}
                                        className="input-field pl-10"
                                        placeholder="10-digit number"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="label">Parent Phone</label>
                            <div className="flex items-center gap-1">
                                <span className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-500 font-bold text-sm">+91</span>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="parentPhone"
                                        value={formData.parentPhone}
                                        onChange={handleInputChange}
                                        className="input-field pl-10"
                                        placeholder="10-digit number"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Official E-mail</label>
                            <input 
                                type="email" 
                                name="officialEmail" 
                                value={formData.officialEmail} 
                                onChange={handleInputChange} 
                                className="input-field"
                                required 
                            />
                        </div>
                        <div>
                            {/* Valid Upto is now auto-calculated */}
                        </div>
                    </div>
                </div>



                <div>
                    <label className="label">Student Photo {!isRealPhoto(existingStudent?.photoUrl) ? '(Required)' : '(Optional to change)'}</label>
                    <div className="flex flex-col md:flex-row gap-4 items-start mt-1">
                        {(photo || isRealPhoto(existingStudent?.photoUrl)) && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                <img 
                                    src={photo ? URL.createObjectURL(photo) : (existingStudent.photoUrl.startsWith('http') ? existingStudent.photoUrl : `/${existingStudent.photoUrl.replace(/\\/g, '/')}`)} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="relative flex-1 w-full">
                            <input type="file" id="photo-upload" onChange={handleFileChange} className="hidden" accept="image/*" />
                            <label htmlFor="photo-upload" className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors">
                                <Upload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600">{photo ? photo.name : (isRealPhoto(existingStudent?.photoUrl) ? "Change photo" : "Click to upload photo")}</span>
                                <span className="text-xs text-gray-400">JPG, PNG (Max 2MB)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Proof Requirements - Dynamically show based on changes */}
                {isStudentView && (needsAadhaar || needsBirthCert || needsAdmissionReceipt) && (
                    <div className="space-y-4 border-t pt-6 mt-6">
                        <div className="flex items-center gap-2 mb-2">
                             <CreditCard className="w-5 h-5 text-blue-600" />
                             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Required Verification Documents</h3>
                        </div>
                        
                        {needsAadhaar && (
                            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${aadhaarProof ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${aadhaarProof ? 'text-green-700' : 'text-red-700'}`}>Aadhaar Card (REQUIRED)</h4>
                                    <p className={`text-[9px] font-bold leading-relaxed ${aadhaarProof ? 'text-green-600' : 'text-red-600'}`}>Verify Name / Address changes</p>
                                </div>
                                <label className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl cursor-pointer transition-all w-full sm:w-auto text-[10px] font-black ${aadhaarProof ? 'bg-green-600 text-white' : 'bg-red-600 text-white shadow-lg'}`}>
                                    <Upload className="w-4 h-4" />
                                    {aadhaarProof ? 'REPLACE AADHAAR' : 'UPLOAD AADHAAR'}
                                    <input type="file" name="aadhaarProof" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                                </label>
                            </div>
                        )}

                        {needsBirthCert && (
                            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${birthCertProof ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${birthCertProof ? 'text-green-700' : 'text-red-700'}`}>Birth Certificate (REQUIRED)</h4>
                                    <p className={`text-[9px] font-bold leading-relaxed ${birthCertProof ? 'text-green-600' : 'text-red-600'}`}>Verify Date of Birth changes</p>
                                </div>
                                <label className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl cursor-pointer transition-all w-full sm:w-auto text-[10px] font-black ${birthCertProof ? 'bg-green-600 text-white' : 'bg-red-600 text-white shadow-lg'}`}>
                                    <Upload className="w-4 h-4" />
                                    {birthCertProof ? 'REPLACE BIRTH CERT' : 'UPLOAD BIRTH CERT'}
                                    <input type="file" name="birthCertProof" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                                </label>
                            </div>
                        )}

                        {needsAdmissionReceipt && (
                            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${admissionProof ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${admissionProof ? 'text-green-700' : 'text-red-700'}`}>Admission Receipt (REQUIRED)</h4>
                                    <p className={`text-[9px] font-bold leading-relaxed ${admissionProof ? 'text-green-600' : 'text-red-600'}`}>Verify Reg No / Dept / Mobile / Type</p>
                                </div>
                                <label className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl cursor-pointer transition-all w-full sm:w-auto text-[10px] font-black ${admissionProof ? 'bg-green-600 text-white' : 'bg-red-600 text-white shadow-lg'}`}>
                                    <Upload className="w-4 h-4" />
                                    {admissionProof ? 'REPLACE RECEIPT' : 'UPLOAD RECEIPT'}
                                    <input type="file" name="admissionProof" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                                </label>
                            </div>
                        )}
                    </div>
                )}

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
