import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Menu, X, School } from 'lucide-react';
import Logo from './Logo';
import NotificationDropdown from './NotificationDropdown';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${location.pathname === '/admin-dashboard' ? 'lg:hidden' : 'lg:relative lg:translate-x-0'} flex flex-col shadow-xl
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 bg-navy-800 border-b border-navy-800">
                    <div className="flex items-center gap-3">
                        <Logo className="h-10 w-auto" />
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 group
                                ${isActive
                                    ? 'bg-navy-800 text-white shadow-lg border border-white/10'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                }
                            `}
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? 'text-blue-400' : ''}`} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 bg-slate-950 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Admin User</p>
                            <p className="text-xs text-gray-400">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 text-sm font-bold active:scale-95 shadow-sm"
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-600 hover:text-gray-900">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <NotificationDropdown userInfo={JSON.parse(localStorage.getItem('userInfo'))} />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
