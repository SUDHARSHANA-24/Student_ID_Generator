import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

const Header = ({ onMenuClick }) => {
    return (
        <header className="px-6 py-4">
            <div className="glass px-6 py-3 flex items-center justify-between">
                {/* Left: Menu Toggle & Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="hidden md:block text-lg font-medium text-white/90">
                        Internal Dashboard
                    </h2>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-4">
                    {/* Search Bar (Visual Only) */}
                    <div className="hidden md:flex items-center px-3 py-1.5 bg-white/10 rounded-full border border-white/20 focus-within:bg-white/20 transition-all">
                        <Search className="w-4 h-4 text-white/70" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/50 w-32 focus:w-48 transition-all"
                        />
                    </div>

                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                        <Bell className="w-5 h-5 text-white/90" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border border-white/20"></span>
                    </button>

                    <div className="h-8 w-px bg-white/20 mx-1"></div>

                    <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                        <div className="bg-gradient-to-tr from-purple-400 to-pink-400 p-0.5 rounded-full shadow-lg">
                            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-white group-hover:text-pink-200 transition-colors">Admin User</p>
                            <p className="text-xs text-white/60">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
