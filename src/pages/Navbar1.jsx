// Navbar1.jsx
import React, { useState, useEffect } from 'react';
import {
    LogOut,
    Menu,
    X,
    UserPlus,
    Users,
    Briefcase,
    Mail,
    Phone,
    User,
    FileText
} from 'lucide-react';
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from '../Images/logo.png';

// API Endpoint
const ADD_EMPLOYEE_API = "https://vanaras.onrender.com/api/v1/superadmin/addEmployee";

// NAV ITEMS
const NAV_ITEM_ALL_EMPLOYEES = {
    name: 'All Employees',
    path: '/employees',
    icon: <Users size={18} />
};

const NAV_ITEM_ASSIGN_WORK = {
    name: 'Assign Work',
    path: '/assignwork',
    icon: <Briefcase size={18} />
};

const NAV_ITEM_REPORTS = {
    name: 'Reports',
    path: '/reports',
    icon: <FileText size={18} />
};

const NAV_ITEM_ADD_EMPLOYEE = {
    name: 'Add Employee',
    icon: <UserPlus size={18} />
};

// -------------------- MODAL --------------------
const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [formData, setFormData] = useState({
        empName: '',
        empEmail: '',
        empMobile: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { empName, empEmail, empMobile } = formData;
        if (!empName || !empEmail || !empMobile) {
            toast.error("All fields are required", { position: "bottom-right" });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(ADD_EMPLOYEE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message);

            toast.success("Employee added successfully", { position: "top-center" });
            onEmployeeAdded();
            setFormData({ empName: '', empEmail: '', empMobile: '' });
            onClose();

        } catch (err) {
            toast.error(err.message || "Failed to add employee", { position: "bottom-right" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <UserPlus size={18} /> Add Employee
                    </h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <input
                        name="empName"
                        placeholder="Employee Name"
                        className="w-full border p-2 rounded"
                        value={formData.empName}
                        onChange={handleChange}
                    />
                    <input
                        name="empEmail"
                        type="email"
                        placeholder="Email"
                        className="w-full border p-2 rounded"
                        value={formData.empEmail}
                        onChange={handleChange}
                    />
                    <input
                        name="empMobile"
                        placeholder="Mobile"
                        className="w-full border p-2 rounded"
                        value={formData.empMobile}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        {isLoading ? "Adding..." : "Add Employee"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// -------------------- NAVBAR --------------------
const Navbar1 = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out", { position: "top-center" });
        navigate("/");
    };

    const navLinkClass = (path) =>
        `px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium
        ${location.pathname === path
            ? "bg-gray-100 text-blue-600"
            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}`;

    return (
        <>
            <nav className="bg-white shadow sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/superadmin/dashboard">
                            <img src={logo} alt="Logo" className="h-14" />
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex gap-1">
                            <Link to={NAV_ITEM_ALL_EMPLOYEES.path} className={navLinkClass(NAV_ITEM_ALL_EMPLOYEES.path)}>
                                {NAV_ITEM_ALL_EMPLOYEES.icon}
                                {NAV_ITEM_ALL_EMPLOYEES.name}
                            </Link>

                            <Link to={NAV_ITEM_ASSIGN_WORK.path} className={navLinkClass(NAV_ITEM_ASSIGN_WORK.path)}>
                                {NAV_ITEM_ASSIGN_WORK.icon}
                                {NAV_ITEM_ASSIGN_WORK.name}
                            </Link>

                            <Link to={NAV_ITEM_REPORTS.path} className={navLinkClass(NAV_ITEM_REPORTS.path)}>
                                {NAV_ITEM_REPORTS.icon}
                                {NAV_ITEM_REPORTS.name}
                            </Link>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-3 py-2 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            >
                                {NAV_ITEM_ADD_EMPLOYEE.icon}
                                {NAV_ITEM_ADD_EMPLOYEE.name}
                            </button>
                        </div>

                        {/* Desktop Logout */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex bg-red-600 text-white px-4 py-2 rounded-lg items-center gap-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden"
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-gray-100 p-3 space-y-2">
                        <Link to={NAV_ITEM_ALL_EMPLOYEES.path} className={navLinkClass(NAV_ITEM_ALL_EMPLOYEES.path)}>
                            {NAV_ITEM_ALL_EMPLOYEES.icon}
                            {NAV_ITEM_ALL_EMPLOYEES.name}
                        </Link>

                        <Link to={NAV_ITEM_ASSIGN_WORK.path} className={navLinkClass(NAV_ITEM_ASSIGN_WORK.path)}>
                            {NAV_ITEM_ASSIGN_WORK.icon}
                            {NAV_ITEM_ASSIGN_WORK.name}
                        </Link>

                        <Link to={NAV_ITEM_REPORTS.path} className={navLinkClass(NAV_ITEM_REPORTS.path)}>
                            {NAV_ITEM_REPORTS.icon}
                            {NAV_ITEM_REPORTS.name}
                        </Link>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200"
                        >
                            {NAV_ITEM_ADD_EMPLOYEE.icon}
                            {NAV_ITEM_ADD_EMPLOYEE.name}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEmployeeAdded={() => {}}
            />
        </>
    );
};

export default Navbar1;
