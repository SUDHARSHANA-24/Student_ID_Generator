import React, { useState } from 'react';
import { Mail, Phone, MapPin, User, School, Shield, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const IDCard = ({ student }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    if (!student) return null;

    const {
        name,
        registerNumber,
        department,
        year,
        dob,
        bloodGroup,
        photoUrl,
        address,
        emergencyContact,
        parentPhone,
        officialEmail,
        validUpto,
        studentType,
        status
    } = student;

    const verificationUrl = `${window.location.origin}/verify/${registerNumber}`;
    const qrData = verificationUrl;

    // Format photo URL
    const formattedPhotoUrl = photoUrl ? `/${photoUrl.replace(/\\/g, '/')}` : '';

    const handleFlip = () => setIsFlipped(!isFlipped);

    // Watermark for discontinued students
    const DiscontinuedWatermark = () => (
        status === 'Discontinued' && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[1px] pointer-events-none">
                <div className="border-8 border-red-600/30 text-red-600/30 font-black text-6xl -rotate-45 px-4 py-2 uppercase tracking-tighter text-center leading-none">
                    Discontinued
                </div>
            </div>
        )
    );


    const Template3Front = () => (
        <div className="absolute inset-0 w-[320px] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col font-['Poppins'] backface-hidden">
            <DiscontinuedWatermark />
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#001f3f] flex items-center justify-center">
                <p className="text-white font-bold text-xl rotate-[270deg] whitespace-nowrap tracking-widest opacity-80 uppercase text-center">
                    {validUpto || '2024 - 2028'}
                </p>
            </div>

            <div className="ml-8 flex-1 flex flex-col items-center">
                <div className="w-full pt-6 px-6 flex flex-col items-center gap-2 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#001f3f] rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-[#001f3f] font-bold text-sm leading-tight tracking-wide">BANNARI AMMAN</h1>
                            <p className="text-gray-500 font-semibold text-[9px] tracking-tighter -mt-0.5">INSTITUTE OF TECHNOLOGY</p>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-2"></div>
                </div>

                <div className="relative mt-2 mb-6">
                    <div className="w-36 h-36 rounded-full border-4 border-[#001f3f]/10 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#001f3f]">
                            <img
                                src={formattedPhotoUrl || "https://via.placeholder.com/150?text=BIT+PHOTO"}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full px-6 flex flex-col items-center text-center space-y-4">
                    <div>
                        <h2 className="text-[#001f3f] font-bold text-xl uppercase tracking-tight leading-tight px-1">
                            {name || 'Student Name'}
                        </h2>
                        <p className="text-blue-600 font-bold text-xs tracking-widest mt-0.5">
                            {registerNumber || '7376XXXXXX'}
                        </p>
                    </div>

                    <div className="space-y-1 py-3 border-y border-gray-100 w-full px-2">
                        <p className="text-gray-800 font-bold text-[10px] uppercase tracking-wide whitespace-normal leading-tight">
                            {department || 'DEPARTMENT NAME'}
                        </p>
                        <p className="text-gray-500 font-semibold text-[20px] tracking-tighter leading-none pt-1">
                            Year: {year || 'I'}
                        </p>
                    </div>
                </div>

                <div className="mt-auto w-full px-8 pb-6 flex justify-between items-end">
                    <div className="flex flex-col items-center">
                        <div className="h-10 flex items-center opacity-80">
                            <span className="font-serif italic text-blue-900 font-bold text-xs whitespace-nowrap">C. Palani</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 tracking-wider pt-0.5 border-t border-gray-200 w-full text-center">PRINCIPAL</p>
                    </div>

                    <div className="p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <QRCodeSVG
                            value={qrData}
                            size={44}
                            level="M"
                            marginSize={2}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            includeMargin={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const Template3Back = () => (
        <div className="absolute inset-0 w-[320px] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col font-['Poppins'] p-6 backface-hidden rotate-y-180">
            <DiscontinuedWatermark />
            <h3 className="text-[#001f3f] font-bold text-xs uppercase tracking-widest mb-6 border-b pb-2">Student Information</h3>
            <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</p>
                        <p className="text-xs font-bold text-[#001f3f]">{bloodGroup || 'O+ve'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Birth Date</p>
                        <p className="text-xs font-bold text-[#001f3f]">{dob ? new Date(dob).toLocaleDateString() : '01-01-2005'}</p>
                    </div>
                </div>

                <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</p>
                    <p className="text-[11px] font-semibold text-gray-700 leading-relaxed uppercase">
                        {address || '123 COLLEGE ROAD, SATHYAMANGALAM, ERODE - 638401'}
                    </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Student Phone</p>
                            <p className="text-xs font-bold text-gray-800">{emergencyContact || '9876543210'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Parent Phone</p>
                            <p className="text-xs font-bold text-gray-800">{parentPhone || '9876543210'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded">
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-800 lowercase break-words max-w-[180px] leading-tight">{officialEmail || 'student@bitsathy.ac.in'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center space-y-1 border border-gray-100">
                <p className="text-[10px] font-bold text-[#001f3f] uppercase">Emergency Helpline</p>
                <p className="text-lg font-bold text-[#001f3f] tracking-widest">1800-425-4500</p>
                <p className="text-[9px] font-medium text-gray-400 italic">24/7 Support Available</p>
            </div>

            <div className="mt-auto pt-4 text-center">
                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">www.bitsathy.ac.in</p>
            </div>
        </div>
    );

    const Template4Front = () => (
        <div className="absolute inset-0 w-[320px] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col font-['Poppins'] backface-hidden">
            <DiscontinuedWatermark />
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#7f1d1d] flex items-center justify-center">
                <p className="text-white font-bold text-xl rotate-[270deg] whitespace-nowrap tracking-widest opacity-80 uppercase text-center">
                    {validUpto || '2024 - 2028'}
                </p>
            </div>

            <div className="ml-8 flex-1 flex flex-col items-center">
                <div className="w-full pt-6 px-6 flex flex-col items-center gap-2 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#7f1d1d] rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-[#7f1d1d] font-bold text-sm leading-tight tracking-wide">BANNARI AMMAN</h1>
                            <p className="text-gray-500 font-semibold text-[9px] tracking-tighter -mt-0.5">INSTITUTE OF TECHNOLOGY</p>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-2"></div>
                </div>

                <div className="relative mt-2 mb-6">
                    <div className="w-36 h-36 rounded-full border-4 border-[#7f1d1d]/10 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#7f1d1d]">
                            <img
                                src={formattedPhotoUrl || "https://via.placeholder.com/150?text=BIT+PHOTO"}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full px-6 flex flex-col items-center text-center space-y-4">
                    <div>
                        <h2 className="text-[#7f1d1d] font-bold text-xl uppercase tracking-tight leading-tight px-1">
                            {name || 'Student Name'}
                        </h2>
                        <p className="text-[#7f1d1d] font-bold text-xs tracking-widest mt-0.5 opacity-80">
                            {registerNumber || '7376XXXXXX'}
                        </p>
                    </div>

                    <div className="space-y-1 py-3 border-y border-gray-100 w-full px-2">
                        <p className="text-gray-800 font-bold text-[10px] uppercase tracking-wide whitespace-normal leading-tight">
                            {department || 'DEPARTMENT NAME'}
                        </p>
                        <p className="text-gray-500 font-semibold text-[20px] tracking-tighter leading-none pt-1">
                            Year: {year || 'I'}
                        </p>
                    </div>
                </div>

                <div className="mt-auto w-full px-8 pb-6 flex justify-between items-end">
                    <div className="flex flex-col items-center">
                        <div className="h-10 flex items-center opacity-80">
                            <span className="font-serif italic text-[#7f1d1d] font-bold text-xs whitespace-nowrap">C. Palani</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 tracking-wider pt-0.5 border-t border-gray-200 w-full text-center">PRINCIPAL</p>
                    </div>

                    <div className="p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <QRCodeSVG
                            value={qrData}
                            size={44}
                            level="M"
                            marginSize={2}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            includeMargin={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const Template4Back = () => (
        <div className="absolute inset-0 w-[320px] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col font-['Poppins'] p-6 backface-hidden rotate-y-180">
            <DiscontinuedWatermark />
            <h3 className="text-[#7f1d1d] font-bold text-xs uppercase tracking-widest mb-6 border-b pb-2">Student Information</h3>
            <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</p>
                        <p className="text-xs font-bold text-[#7f1d1d]">{bloodGroup || 'O+ve'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Birth Date</p>
                        <p className="text-xs font-bold text-[#7f1d1d]">{dob ? new Date(dob).toLocaleDateString() : '01-01-2005'}</p>
                    </div>
                </div>

                <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</p>
                    <p className="text-[11px] font-semibold text-gray-700 leading-relaxed uppercase">
                        {address || '123 COLLEGE ROAD, SATHYAMANGALAM, ERODE - 638401'}
                    </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-50 rounded">
                            <Phone className="w-3.5 h-3.5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Student Phone</p>
                            <p className="text-xs font-bold text-gray-800">{emergencyContact || '9876543210'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-50 rounded">
                            <Phone className="w-3.5 h-3.5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Parent Phone</p>
                            <p className="text-xs font-bold text-gray-800">{parentPhone || '9876543210'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-50 rounded">
                            <Mail className="w-3.5 h-3.5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-800 lowercase break-words max-w-[180px] leading-tight">{officialEmail || 'student@bitsathy.ac.in'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center space-y-1 border border-gray-100">
                <p className="text-[10px] font-bold text-[#7f1d1d] uppercase">Emergency Helpline</p>
                <p className="text-lg font-bold text-[#7f1d1d] tracking-widest">1800-425-4500</p>
                <p className="text-[9px] font-medium text-gray-400 italic">24/7 Support Available</p>
            </div>

            <div className="mt-auto pt-4 text-center">
                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">www.bitsathy.ac.in</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-6 py-8">
            <div
                id="id-card"
                className="group perspective-1000 cursor-pointer"
                onClick={handleFlip}
            >
                <div className={`relative w-[320px] h-[500px] preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {studentType === 'Hosteller' ? (
                        <>
                            <Template3Front />
                            <Template3Back />
                        </>
                    ) : (
                        <>
                            <Template4Front />
                            <Template4Back />
                        </>
                    )}
                </div>
            </div>

            <button
                onClick={handleFlip}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-bold transition-all shadow-sm border border-slate-200"
            >
                <RefreshCw className="w-3.5 h-3.5" />
                Click to Rotate ID Card
            </button>
        </div>
    );
};

export default IDCard;
