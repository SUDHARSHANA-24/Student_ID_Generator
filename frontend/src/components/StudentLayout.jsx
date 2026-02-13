import { useNavigate } from 'react-router-dom';
import { LogOut, School } from 'lucide-react';

const StudentLayout = ({ children }) => {
    const navigate = useNavigate();
    // const studentInfo = JSON.parse(localStorage.getItem('studentInfo'));

    const handleLogout = () => {
        localStorage.removeItem('studentInfo');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-600 rounded-lg">
                                    <School className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">Student Portal</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Student ID System. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default StudentLayout;
