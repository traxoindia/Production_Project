// Navbar1.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X, UserPlus, Users, Briefcase, Mail, Phone, User } from 'lucide-react'; // Added Briefcase icon for Assign Work
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from '../Images/logo.png';

// API Endpoint for adding a new employee (POST method)
const ADD_EMPLOYEE_API = "https://vanaras.onrender.com/api/v1/superadmin/addEmployee";

// Define the Navigation Item constants
const NAV_ITEM_ADD_EMPLOYEE = { 
    name: 'Add Employee', 
    icon: <UserPlus size={18} /> 
};

const NAV_ITEM_ALL_EMPLOYEES = {
    name: 'All Employees',
    path: '/employees', // Link path
    icon: <Users size={18} />
};

const NAV_ITEM_ASSIGN_WORK = { // NEW NAV ITEM
    name: 'Assign Work',
    path: '/assignwork', 
    icon: <Briefcase size={18} />
};

// --- 🧱 Employee Creation Modal Component (Unchanged) ---
const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [formData, setFormData] = useState({ 
        empName: '', 
        empEmail: '', 
        empMobile: '' 
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { empName, empEmail, empMobile } = formData;
        if (!empName.trim() || !empEmail.trim() || !empMobile.trim()) {
            toast.error("All fields are required.", { position: "bottom-right" });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Authentication token is missing. Please log in.", { position: "bottom-right" });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(ADD_EMPLOYEE_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ 
                    empName: empName,
                    empEmail: empEmail,
                    empMobile: empMobile
                })
            });
            
            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage = data.message || `Failed to add employee. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            toast.success(`Employee "${empName}" added successfully!`, { position: "top-center" });
            
            onEmployeeAdded(); 
            setFormData({ empName: '', empEmail: '', empMobile: '' });
            onClose(); 

        } catch (error) {
            console.error("Error adding employee:", error);
            toast.error(`Error: ${error.message || "Could not add employee."}`, { position: "bottom-right" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <UserPlus size={20} /> Add New Employee
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Employee Name (empName) */}
                        <div>
                            <label htmlFor="empName" className="block text-sm font-medium text-gray-700 mb-1">
                                Employee Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    id="empName"
                                    name="empName"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., John Doe"
                                    value={formData.empName}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email (empEmail) */}
                        <div>
                            <label htmlFor="empEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    id="empEmail"
                                    name="empEmail"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="john.doe@example.com"
                                    value={formData.empEmail}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Mobile No. (empMobile) */}
                        <div>
                            <label htmlFor="empMobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile No.
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    id="empMobile"
                                    name="empMobile"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 9876543210"
                                    value={formData.empMobile}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <UserPlus size={18} className="mr-2" />
                                    Add Employee
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- End Modal Component ---

const Navbar1 = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Effect to close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logout successful!", { position: "top-center" });
        setTimeout(() => {
            navigate("/");
        }, 700);
    };

    return (
        <>
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
                            
                            {/* ALL EMPLOYEES Link */}
                            <Link
                                to={NAV_ITEM_ALL_EMPLOYEES.path}
                                className={`text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 
                                            rounded-lg text-sm font-medium flex items-center gap-1
                                            ${location.pathname === NAV_ITEM_ALL_EMPLOYEES.path ? 'bg-gray-100 text-blue-600' : ''}`}
                            >
                                {NAV_ITEM_ALL_EMPLOYEES.icon}
                                {NAV_ITEM_ALL_EMPLOYEES.name}
                            </Link>

                            {/* ASSIGN WORK Link (NEW) */}
                            <Link
                                to={NAV_ITEM_ASSIGN_WORK.path}
                                className={`text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 
                                            rounded-lg text-sm font-medium flex items-center gap-1
                                            ${location.pathname === NAV_ITEM_ASSIGN_WORK.path ? 'bg-gray-100 text-blue-600' : ''}`}
                            >
                                {NAV_ITEM_ASSIGN_WORK.icon}
                                {NAV_ITEM_ASSIGN_WORK.name}
                            </Link>


                            {/* Add Employee Button (Opens Modal) */}
                            <button
                                onClick={() => setIsModalOpen(true)} // Open modal on click
                                className={`text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 
                                            rounded-lg text-sm font-medium flex items-center gap-1`}
                            >
                                {NAV_ITEM_ADD_EMPLOYEE.icon}
                                {NAV_ITEM_ADD_EMPLOYEE.name}
                            </button>
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
                        
                        {/* Mobile ALL EMPLOYEES Link */}
                        <Link
                            to={NAV_ITEM_ALL_EMPLOYEES.path}
                            onClick={() => setIsMenuOpen(false)} // Close menu on click
                            className={`w-full text-left text-gray-700 hover:bg-gray-200 
                                        px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2
                                        ${location.pathname === NAV_ITEM_ALL_EMPLOYEES.path ? 'bg-gray-200 text-blue-600' : ''}`}
                        >
                            {NAV_ITEM_ALL_EMPLOYEES.icon}
                            {NAV_ITEM_ALL_EMPLOYEES.name}
                        </Link>
                        
                        {/* Mobile ASSIGN WORK Link (NEW) */}
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

                        {/* Mobile Add Employee Button (Opens Modal) */}
                        <button
                            onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }} // Close menu, open modal
                            className={`w-full text-left text-gray-700 hover:bg-gray-200 
                                        px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2`}
                        >
                            {NAV_ITEM_ADD_EMPLOYEE.icon}
                            {NAV_ITEM_ADD_EMPLOYEE.name}
                        </button>
                        
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
        
        {/* The Modal Component */}
        <AddEmployeeModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onEmployeeAdded={() => { /* Add logic to refresh employee list if needed in the parent view */ }}
        />
        </>
    );
};

export default Navbar1;