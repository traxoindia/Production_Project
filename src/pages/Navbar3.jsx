// Navbar3.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X, Briefcase, ClipboardList } from 'lucide-react'; // Added ClipboardList for "Work"
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from '../Images/logo.png';

// Define the Navigation Item constants
const NAV_ITEM_ASSIGN_WORK = {
    name: 'Assign Work',
    path: '/assignworkProduction',
    icon: <Briefcase size={18} />
};

const NAV_ITEM_WORK = { // NEW NAV ITEM
    name: 'Work',
    path: '/work',
    icon: <ClipboardList size={18} />
};

const Navbar3 = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Effect to close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        // --- LOGOUT LOGIC: Deletes the authentication token from localStorage ---
        localStorage.removeItem("token"); 

        // Show toast
        toast.success("Logout successful!", { position: "top-center" });

        // Navigate after delay (so toast is visible)
        setTimeout(() => {
            navigate("/");
        }, 700);
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo and Desktop Links */}
                    <div className="flex items-center">
                        <Link to="/superadmin/dashboard" className="flex-shrink-0"> 
                            <img
                                src={logo}
                                alt="VLTD Logo"
                                className="h-16 w-auto"
                            />
                        </Link>

                        <div className="hidden md:flex ml-10 space-x-1 items-center">

                            {/* WORK Link (NEW) */}
                            <Link
                                to={NAV_ITEM_WORK.path}
                                className={`text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 
                                            rounded-lg text-sm font-medium flex items-center gap-1
                                            ${location.pathname === NAV_ITEM_WORK.path ? 'bg-gray-100 text-blue-600' : ''}`}
                            >
                                {NAV_ITEM_WORK.icon}
                                {NAV_ITEM_WORK.name}
                            </Link>

                            {/* ASSIGN WORK Link */}
                            <Link
                                to={NAV_ITEM_ASSIGN_WORK.path}
                                className={`text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 
                                            rounded-lg text-sm font-medium flex items-center gap-1
                                            ${location.pathname === NAV_ITEM_ASSIGN_WORK.path ? 'bg-gray-100 text-blue-600' : ''}`}
                            >
                                {NAV_ITEM_ASSIGN_WORK.icon}
                                {NAV_ITEM_ASSIGN_WORK.name}
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Logout Button */}
                    <div className="hidden md:block">
                        <button
                            onClick={handleLogout}
                            className="bg-yellow-700 hover:bg-yellow-500 text-white px-4 py-2 
                                       rounded-lg text-sm font-semibold transition duration-150 
                                       shadow flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 p-2 rounded-md hover:bg-gray-200"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-100 pb-3 shadow-inner">
                    <div className="px-3 pt-3 pb-2 space-y-2">

                        {/* Mobile WORK Link (NEW) */}
                        <Link
                            to={NAV_ITEM_WORK.path}
                            onClick={() => setIsMenuOpen(false)} // Close menu on click
                            className={`w-full text-left text-gray-700 hover:bg-gray-200 
                                        px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2
                                        ${location.pathname === NAV_ITEM_WORK.path ? 'bg-gray-200 text-blue-600' : ''}`}
                        >
                            {NAV_ITEM_WORK.icon}
                            {NAV_ITEM_WORK.name}
                        </Link>
                        
                        {/* Mobile ASSIGN WORK Link */}
                        <Link
                            to={NAV_ITEM_ASSIGN_WORK.path}
                            onClick={() => setIsMenuOpen(false)} // Close menu on click
                            className={`w-full text-left text-gray-700 hover:bg-gray-200 
                                        px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2
                                        ${location.pathname === NAV_ITEM_ASSIGN_WORK.path ? 'bg-gray-200 text-blue-600' : ''}`}
                        >
                            {NAV_ITEM_ASSIGN_WORK.icon}
                            {NAV_ITEM_ASSIGN_WORK.name}
                        </Link>

                        {/* Mobile Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white 
                                       px-3 py-2 rounded-lg text-base font-medium 
                                       flex items-center gap-2 mt-2"
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

export default Navbar3;