import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Check, Info } from 'lucide-react';

const NotificationDropdown = ({ userInfo }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('/api/notifications', config);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.token) {
            fetchNotifications();
            // Optional: Set up polling or sockets for real-time
            const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
            return () => clearInterval(interval);
        }
    }, [userInfo]);

    const markAsRead = async (id) => {
        if (!id) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`/api/notifications/${id}/read`, {}, config);
            setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put('/api/notifications/read-all', {}, config);
            setNotifications(p => p.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-navy-800 transition-colors rounded-full hover:bg-slate-100"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-crimson-600 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-top-right">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-navy-600" /> Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs font-bold text-navy-600 hover:text-navy-800"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => (
                                        <div 
                                            key={notification._id} 
                                            className={`p-4 transition-colors hover:bg-slate-50 flex gap-3 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => {
                                                if (!notification.isRead) markAsRead(notification._id);
                                            }}
                                        >
                                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-crimson-600 animate-pulse'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${notification.isRead ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button 
                                                    className="text-gray-300 hover:text-navy-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification._id);
                                                    }}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
