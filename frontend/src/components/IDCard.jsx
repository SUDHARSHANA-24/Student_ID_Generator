import React from 'react';
import { Mail, Phone, MapPin, User, School, Shield } from 'lucide-react';

const IDCard = ({ student }) => {
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
        studentType
    } = student;

    // Format photo URL
    const formattedPhotoUrl = photoUrl ? `/${photoUrl.replace(/\\/g, '/')}` : '';

    // Frontend Side Components
    const FrontSide = () => (
        <div className="w-[320px] h-[500px] bg-white rounded-lg shadow-2xl border border-gray-300 relative overflow-hidden flex flex-col font-sans text-left">
            {/* Top Header */}
            <div className="flex h-20 border-b border-gray-200">
                <div className="w-16 flex items-center justify-center p-2">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs p-1">
                        {/* Simplified Logo Placeholder */}
                        <div className="border-2 border-white rounded-full w-full h-full flex items-center justify-center">
                            BIT
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center px-2">
                    <h1 className="text-[#003399] font-black text-lg leading-tight tracking-tight">BANNARI AMMAN</h1>
                    <h2 className="text-black font-bold text-[10px] tracking-wide">INSTITUTE OF TECHNOLOGY</h2>
                </div>
            </div>

            {/* Left Vertical Band */}
            <div className="absolute left-0 top-20 bottom-24 w-12 bg-[#003399] flex items-center justify-center">
                <p className="text-white font-bold text-lg rotate-[270deg] whitespace-nowrap tracking-widest">
                    {validUpto || '2023 - 2027'}
                </p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 ml-12 p-4 flex flex-col items-center pt-8">
                {/* Photo Area */}
                <div className="w-36 h-44 bg-gray-100 border-2 border-gray-300 rounded overflow-hidden relative mb-6">
                    <img
                        src={formattedPhotoUrl || "https://via.placeholder.com/150"}
                        alt={name || 'Student'}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=BIT+PHOTO"; }}
                    />
                    {/* Hologram Sticker Placeholder */}
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 opacity-60 flex items-center justify-center">
                        <div className="w-full h-full rounded-full border border-white/50 animate-pulse"></div>
                    </div>
                </div>

                {/* Name */}
                <h3 className="text-black font-black text-xl mb-4 tracking-tight uppercase text-center w-full px-2">
                    {name || 'SUBIKSHA R'}
                </h3>

                {/* Register Number Band */}
                <div className="w-full bg-[#003399] py-1 text-center mb-2">
                    <p className="text-white font-bold text-lg tracking-wider">
                        {registerNumber || '7376232CB155'}
                    </p>
                </div>

                {/* Course/Department */}
                <p className="text-black font-black text-sm text-center">
                    {department || 'B.Tech. - CSBS'}
                </p>
            </div>

            {/* Bottom Section */}
            <div className="h-24 px-4 flex justify-between items-end pb-4 border-t border-gray-100">
                {/* Hosteller/Days Scholar Badge */}
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-3xl
                    ${studentType === 'Hosteller' ? 'border-[#003399] text-[#003399]' : 'border-green-600 text-green-600'}`}>
                    {studentType === 'Hosteller' ? 'H' : 'D'}
                </div>

                {/* Signatory */}
                <div className="flex flex-col items-center">
                    <div className="h-8 flex items-end">
                        <span className="font-serif italic text-sm text-gray-700 font-bold opacity-70">C. Palani</span>
                    </div>
                    <p className="text-[10px] font-black tracking-tighter text-black border-t border-black px-2 pt-0.5">PRINCIPAL</p>
                </div>
            </div>
        </div>
    );

    const BackSide = () => (
        <div className="w-[320px] h-[500px] bg-white rounded-lg shadow-2xl border border-gray-300 relative overflow-hidden flex flex-col font-sans p-4 text-[11px] text-left">
            {/* Header Details */}
            <div className="space-y-1 mb-4">
                <div className="flex">
                    <span className="w-16 font-black text-black">B.G. :</span>
                    <span className="font-bold text-gray-800">{bloodGroup || 'O+ve'}</span>
                </div>
                <div className="flex">
                    <span className="w-16 font-black text-black">D.O.B. :</span>
                    <span className="font-bold text-gray-800">{dob ? new Date(dob).toLocaleDateString('en-GB').replace(/\//g, '-') : '20-07-2006'}</span>
                </div>
            </div>

            {/* Address */}
            <div className="mb-6">
                <span className="block font-black text-black mb-1 text-left">ADDRESS :</span>
                <div className="pl-2 font-bold text-gray-700 leading-tight whitespace-pre-wrap uppercase text-left">
                    {address || "D/o. Mr. RAJENDRAN K\nACHIYUR PUDUR\nACHIYUR PO\nDHARAPURAM - 638673\nTIRUPUR - Dt., TN"}
                </div>
            </div>

            {/* Phone & Email */}
            <div className="space-y-1 mb-6 text-left">
                <div className="flex">
                    <span className="w-32 font-black text-black">STUDENT PHONE :</span>
                    <span className="font-black text-black">{emergencyContact || '9445657445'}</span>
                </div>
                <div className="flex">
                    <span className="w-32 font-black text-black">PARENT PHONE :</span>
                    <span className="font-black text-black">{parentPhone || '9362947445'}</span>
                </div>
                <div className="mt-2 text-left">
                    <span className="block font-black text-black mb-1">OFFICIAL E-MAIL :</span>
                    <span className="block pl-2 font-black text-black truncate">{officialEmail || `student@bitsathy.ac.in`}</span>
                </div>
            </div>

            {/* Separator Line */}
            <div className="border-t border-black w-full my-2"></div>

            {/* Helpline Section */}
            <div className="text-center space-y-1">
                <p className="font-black text-[12px] text-black">Antiragging Helpline</p>
                <p className="font-black text-lg text-black">1800 180 5522</p>
            </div>

            <div className="mt-4 text-center">
                <p className="font-black text-[10px] text-black underline mb-2">BIT - ANTIRAGGING COMMITTEE</p>
                <div className="flex justify-between px-2 font-black text-[9px] text-black text-left">
                    <div className="flex flex-col items-start leading-none">
                        <span>Head - Principal - 9842217170</span>
                        <span>Coordinator - 6381044500</span>
                    </div>
                </div>
            </div>

            {/* Website Bar */}
            <div className="mt-auto -mx-4 -mb-4 bg-black py-2 text-center">
                <p className="text-white font-black text-xs tracking-wider">www.bitsathy.ac.in</p>
            </div>
        </div>
    );

    return (
        <div id="id-card" className="flex flex-wrap gap-12 justify-center py-8">
            <FrontSide />
            <BackSide />
        </div>
    );
};

export default IDCard;
