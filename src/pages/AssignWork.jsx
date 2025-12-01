// AssignWork.jsx

import React, { useState, useEffect } from 'react';
import { Plus, X, Briefcase, User, Users, RefreshCw, ClipboardList, Send, ChevronDown } from 'lucide-react'; // Added ChevronDown for select input
import { toast } from 'react-toastify';
import Navbar3 from '../pages/Navbar3'; // Adjust path as necessary
import Navbar1 from './Navbar1';

// API Endpoints
const FETCH_EMPLOYEES_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllEmployee"; 
const ASSIGN_WORK_API = "https://vanaras.onrender.com/api/v1/superadmin/AssignWorkToEmployee"; 
const FETCH_ASSIGNMENTS_API = "https://vanaras.onrender.com/api/v1/superadmin/epartment_Head_Show_Assign_work_Employee"; 

// --- FIXED WORK TITLE OPTIONS ---
const WORK_TITLE_OPTIONS = [
    'Add Barcode', 
    'Soldering', 
    'Battery connection & Capacitor & add battery', 
    'Frimware update', // Corrected spelling to Firmware update for general use, if intended
    'QC check', 
    'Print Sticker'
];


// --- 🧱 Modal Component: AssignWorkModal ---
const AssignWorkModal = ({ isOpen, onClose, onAssignmentMade, employees }) => {
    const [formData, setFormData] = useState({ 
        empId: '', 
        workTitel: '', // Will hold the selected option
        workDescription: '' 
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const selectedEmployeeName = employees.find(e => e.id === formData.empId)?.name;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { empId, workTitel, workDescription } = formData;
        // Check if a title was selected (value must not be empty string)
        if (!empId || !workTitel || !workDescription.trim()) {
            toast.error("Please fill in all required fields.", { position: "bottom-right" });
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
            const payload = {
                empId: empId,
                workTitel: workTitel, // Send the selected title
                workDescription: workDescription.trim(), 
            };
            
            const response = await fetch(ASSIGN_WORK_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage = data.message || `Failed to assign work. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            toast.success(`Work titled "${workTitel}" assigned to ${selectedEmployeeName} successfully!`, { position: "top-center" });
            
            onAssignmentMade(); 
            setFormData({ empId: '', workTitel: '', workDescription: '' });
            onClose(); 

        } catch (error) {
            console.error("Error assigning work:", error);
            toast.error(`Error: ${error.message || "Could not assign work."}`, { position: "bottom-right" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <ClipboardList size={20} /> Assign New Work
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
                        
                        {/* Employee Select */}
                        <div>
                            <label htmlFor="empId" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Employee
                            </label>
                            <div className="relative">
                                <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    id="empId"
                                    name="empId"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                    value={formData.empId}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Work Title Dropdown (UPDATED) */}
                        <div>
                            <label htmlFor="workTitel" className="block text-sm font-medium text-gray-700 mb-1">
                                Work Title
                            </label>
                            <div className="relative">
                                <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    id="workTitel"
                                    name="workTitel"
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                    value={formData.workTitel}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">-- Select Work Title --</option>
                                    {WORK_TITLE_OPTIONS.map((title) => (
                                        <option key={title} value={title}>
                                            {title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Work Description (workDescription) */}
                        <div>
                            <label htmlFor="workDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Work Description
                            </label>
                            <textarea
                                id="workDescription"
                                name="workDescription"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Details of the task and expected outcomes..."
                                value={formData.workDescription}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
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
                                    <Send size={18} className="mr-2" />
                                    Assign Work
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- 💻 Main Component: AssignWork ---
function AssignWork() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]); 
    const [assignments, setAssignments] = useState([]); 
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // 1. Fetch Employees (for Modal Dropdown) - Unchanged Logic
    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(FETCH_EMPLOYEES_API, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            
            if (data.emp && Array.isArray(data.emp)) {
                const formattedEmployees = data.emp.map(emp => ({
                    id: emp._id,
                    name: emp.empName || 'N/A',
                    department: emp.departmentHeadId ? 'Assigned' : 'Unassigned', 
                }));
                setEmployees(formattedEmployees);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Failed to load employee list.", { position: "top-center" });
            setEmployees([]); 
        } finally {
            setLoadingEmployees(false);
        }
    };

    // 2. Fetch Assignments (for Table) - Unchanged Logic (Uses assignWorkList)
    const fetchAssignments = async () => {
        setLoadingAssignments(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(FETCH_ASSIGNMENTS_API, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch assignments: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.assignWorkList && Array.isArray(data.assignWorkList)) {
                const fetchedAssignments = data.assignWorkList.map(assignment => ({
                    id: assignment._id,
                    employeeName: assignment.workAssignToId?.empName || 'Unknown Employee', 
                    taskTitle: assignment.workTitel || 'No Title',
                    task: assignment.workDescription || 'No Description',
                    assignedDate: new Date(assignment.createdAt).toLocaleDateString(), 
                    status: assignment.status ? 'Completed' : 'Pending', 
                }));

                setAssignments(fetchedAssignments);
            } else {
                 console.error("API response structure is incorrect: missing 'assignWorkList' array.");
                 setAssignments([]);
            }

        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error(`Error loading assignments: ${error.message}.`, { position: "top-right" });
            setAssignments([]); 
        } finally {
            setLoadingAssignments(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchAssignments();
    }, [refreshTrigger]);


    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Navbar1/>
        
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header and Button */}
                    <header className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <ClipboardList size={30} className="text-blue-600" />
                            Work Assignment Control
                        </h1>
                        
                        {/* Assign Work Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white 
                                       font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                            disabled={loadingEmployees || employees.length === 0} 
                        >
                            <Plus size={20} className="mr-2" />
                            Assign New Work
                        </button>
                    </header>
                    
                    {/* --- Assignments Table UI --- */}
                    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Recent Assignments ({assignments.length})
                            </h2>
                             <button 
                                onClick={() => setRefreshTrigger(prev => prev + 1)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm"
                                disabled={loadingAssignments}
                            >
                                <RefreshCw size={16} className={`inline mr-1 ${loadingAssignments ? 'animate-spin' : ''}`} />
                                {loadingAssignments ? 'Refreshing...' : 'Refresh List'}
                            </button>
                        </div>
                        
                        {loadingAssignments ? (
                            <div className="p-8 text-center text-gray-500">
                                <p className="mt-2">Loading Assignments...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assignments.length > 0 ? (
                                            assignments.map((assignment) => (
                                                <tr key={assignment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.employeeName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.taskTitle}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{assignment.task}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.assignedDate}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                                                            {assignment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {/* This button logic would typically trigger a POST/PUT request to change status */}
                                                        {assignment.status === 'Pending' && (
                                                            <button className="text-red-600 hover:text-red-900">Mark Done</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    No work assignments found. Click 'Assign New Work' to create one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* The Modal */}
            <AssignWorkModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAssignmentMade={() => setRefreshTrigger(prev => prev + 1)} 
                employees={employees} 
            />
        </>
    );
}

export default AssignWork;