// DealerNavbar.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X, ChevronDown, Briefcase, Users, ClipboardList } from 'lucide-react';
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from '../Images/logo.png';

// API Endpoint
const API_URL = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllDepartment";

// Dummy Navigation Items (for desktop)
const NAV_ITEMS = [
    { name: 'Dashboard', path: '/superadmin/dashboard', icon: <ClipboardList size={18} /> },
    { name: 'Team', path: '/superadmin/team', icon: <Users size={18} /> },
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false); 
    const [departments, setDepartments] = useState([]); // State to hold fetched departments
    const [isLoading, setIsLoading] = useState(true); // State to handle loading status
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchDepartments = async () => {
            const token = localStorage.getItem("token"); // Get token from local storage

            if (!token) {
                console.error("Authentication token not found.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        // Include the token in the headers
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data);
                
                if (data.allDepartment && Array.isArray(data.allDepartment)) {
                    const formattedDepartments = data.allDepartment.map(dept => {
                        // **CORRECTION HERE: Use dept.DepartmentName (capitalized)**
                        const name = dept.DepartmentName || 'Unknown Department';
                        
                        return {
                            name: name,
                            // Corrected path generation using 'DepartmentName'
                            path: `/departments/${name.toLowerCase().replace(/\s+/g, '-')}`,
                            id: dept._id 
                        };
                    });

                    setDepartments(formattedDepartments);
                } else {
                    console.error("API response structure is incorrect: missing allDepartment array.");
                    setDepartments([]);
                }

            } catch (error) {
                console.error("Error fetching departments:", error);
                toast.error("Failed to load departments.", { position: "top-center" });
                setDepartments([]); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchDepartments();
    }, [departments]); // Empty dependency array means this runs once on mount
    // ---------------------------

    // Effect to close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsMobileDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logout successful!", { position: "top-center" });
        setTimeout(() => {
            navigate("/");
        }, 700);
    };

    const handleDepartmentClick = (path) => {
        navigate(path);
        // Close mobile menu/dropdown after clicking a link
        setIsMobileDropdownOpen(false);
        setIsMenuOpen(false);
    };
    
    // --- Dropdown Content Status ---
    let dropdownContent;
    if (isLoading) {
        dropdownContent = (
            <div className="w-full text-center py-2 text-sm text-gray-500">Loading...</div>
        );
    } else if (departments.length === 0) {
        dropdownContent = (
            <div className="w-full text-center py-2 text-sm text-gray-500">No departments found.</div>
        );
    } else {
        dropdownContent = departments.map((dept) => (
            <Link
                key={dept.id} // Use the unique ID as the key
                to={dept.path}
                onClick={() => setIsMenuOpen(false)} // Close mobile menu if desktop link is clicked
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 
                           hover:bg-gray-100 hover:text-blue-600 transition duration-150"
            >
                {dept.name}
            </Link>
        ));
    }


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
                        
                        {/* Desktop Navigation Container */}
                        <div className="hidden md:flex ml-10 space-x-1 items-center">
                            
                            {/* Dummy Navigation Items */}
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-gray-700 hover:text-blue-600 px-3 py-2 
                                                rounded-md text-sm font-medium flex items-center gap-1
                                                ${location.pathname === item.path ? 'bg-gray-100 text-blue-600' : ''}`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                            
                            {/* Departments Dropdown (Desktop - HOVER) */}
                            <div className="relative group">
                                <button
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 
                                               rounded-md text-sm font-medium flex items-center gap-1"
                                    // Disable button interactions if loading
                                    disabled={isLoading}
                                >
                                    <Briefcase size={18} />
                                    {isLoading ? 'Loading...' : 'Departments'}
                                    <ChevronDown 
                                        size={16} 
                                        className="transform transition-transform duration-200 group-hover:rotate-180" 
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                <div 
                                    className="absolute mt-2 w-72 rounded-md shadow-lg bg-white 
                                               ring-1 ring-black ring-opacity-5 focus:outline-none 
                                               origin-top-left opacity-0 invisible group-hover:opacity-100 
                                               group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100"
                                >
                                    <div className="py-1">
                                        {dropdownContent} 
                                    </div>
                                </div>
                            </div>
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
                        
                        {/* Mobile Dummy Navigation Items */}
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)} // Close menu on click
                                className={`w-full text-left text-gray-700 hover:bg-gray-200 
                                            px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2
                                            ${location.pathname === item.path ? 'bg-gray-200 text-blue-600' : ''}`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        ))}
                        
                        {/* Mobile Departments Menu Item (Dropdown - Click based) */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                                className="w-full text-left text-gray-700 hover:bg-gray-200 
                                           px-3 py-2 rounded-lg text-base font-medium flex items-center justify-between"
                                disabled={isLoading}
                            >
                                <span className='flex items-center gap-2'>
                                    <Briefcase size={18} />
                                    {isLoading ? 'Loading...' : 'Departments'}
                                </span>
                                <ChevronDown 
                                    size={16} 
                                    className={`transform transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                                />
                            </button>
                            
                            {/* Mobile Dropdown Items List */}
                            {isMobileDropdownOpen && (
                                <div className="pl-6 space-y-1 bg-white rounded-lg py-1 shadow">
                                    {/* Render dropdown content for mobile */}
                                    {isLoading ? (
                                        <div className="w-full text-center block px-3 py-2 text-sm text-gray-500">Loading...</div>
                                    ) : departments.length > 0 ? (
                                        departments.map((dept) => (
                                            <button
                                                key={dept.id}
                                                onClick={() => handleDepartmentClick(dept.path)}
                                                className="w-full text-left block px-3 py-2 text-sm text-gray-700 
                                                           hover:bg-blue-50 hover:text-blue-600 transition duration-150 rounded-lg"
                                            >
                                                {dept.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="w-full text-center block px-3 py-2 text-sm text-gray-500">No departments.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        
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

export default Navbar;