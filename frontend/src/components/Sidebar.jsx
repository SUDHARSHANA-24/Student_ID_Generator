import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, X, GraduationCap } from 'lucide-react';

const Sidebar = ({ onClose }) => {
    const navItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
        { name: 'Student Login', path: '/student-login', icon: Users },
    ];

    return (
        <div className="h-full px-4 py-6 glass flex flex-col border-r border-white/20">
            {/* Logo Area */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xl font-bold font-heading tracking-wide">EduID Gen</span>
                </div>
                <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded-md transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-white/20 shadow-lg border border-white/30 text-white font-semibold'
                                : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <NavLink
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-red-300 rounded-xl transition-all duration-300 group"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Logout</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
