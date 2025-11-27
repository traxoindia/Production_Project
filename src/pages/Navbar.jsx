// DealerNavbar.jsx
import React from 'react';
import { LogOut, MapPin, Menu, X, Home, Settings } from 'lucide-react';
// Assuming the path is correct:
import logo from '../Images/logo.png'; 

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Placeholder function for handling logout
    const handleLogout = () => {
        // 1. Clear authentication token (mock action)
        localStorage.removeItem('token');
        
        // 2. Redirect the user (mock action: redirecting to home/login page)
        alert("Logout successful! Redirecting to login page...");
        // In a real app: window.location.href = '/login';
    };

    // 🎯 Nav items list removed as requested.

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-40  ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 🎯 UPDATED: Logo and Brand Name */}
                    <div className="flex items-center ">
                        <img 
                            src={logo} 
                            alt="VLTD Backend Logo" 
                            className="h-16 w-auto" // Set appropriate size for the logo
                        />
                        {/* Removed: text brand name span */}
                    </div>

                    {/* 🎯 REMOVED: Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* This section is intentionally empty */}
                    </div>

                    {/* Desktop Logout Button */}
                    <div className="hidden md:block">
                        <button
                            onClick={handleLogout}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 shadow-md flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    {/* The menu button is now only for the Logout button on mobile */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white p-2 rounded-md"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Content (Only Logout button remains) */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-700 pb-3 transition-all duration-300 ease-in-out">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {/* 🎯 REMOVED: Mobile Navigation Links */}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;