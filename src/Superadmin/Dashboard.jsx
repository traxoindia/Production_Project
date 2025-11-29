import React, { useState } from 'react';
import { 
    Users, Briefcase, CheckCircle, Clock, TrendingUp, BarChart, Plus, X 
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../pages/Navbar'; // Ensure this path is correct

// API Endpoint for creating a department (POST method)
const CREATE_DEPARTMENT_API = "https://vanaras.onrender.com/api/v1/superadmin/createDepartment";

// --- MOCK DATA (Kept for context) ---
const ADMIN_STATS_DATA = [
    { id: 1, title: 'Total Active Users', value: '580', icon: Users, color: 'bg-blue-100 text-blue-800' },
    { id: 2, title: 'Active Departments', value: '6', icon: Briefcase, color: 'bg-green-100 text-green-800' },
    { id: 3, title: 'Pending Approvals', value: '14', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { id: 4, title: 'System Uptime (Last 30 Days)', value: '99.9%', icon: CheckCircle, color: 'bg-purple-100 text-purple-800' },
];

const RECENT_ADMIN_ACTIVITY = [
    { id: 1, type: 'User Mgmt', description: 'New user account created for S. Sharma (HR).', time: '12 minutes ago', status: 'Success' },
    { id: 2, type: 'Access', description: 'Access level updated for J. Singh (Software Dept).', time: '2 hours ago', status: 'Success' },
    { id: 3, type: 'System Log', description: 'Database backup initiated.', time: '5 hours ago', status: 'In Progress' },
    { id: 4, type: 'Approval', description: 'Pending request for budget alignment reviewed.', time: '1 day ago', status: 'Pending' },
];

// --- 🧱 Modal Component ---
const CreateDepartmentModal = ({ isOpen, onClose }) => {
    const [departmentName, setDepartmentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const trimmedName = departmentName.trim();
        if (!trimmedName) {
            toast.error("Department name cannot be empty.", { position: "bottom-right" });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Authentication token is missing. Please log in again.", { position: "bottom-right" });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(CREATE_DEPARTMENT_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    // Providing the Token as requested
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ 
                    // Input field is { DepartmentName }
                    DepartmentName: trimmedName 
                })
            });
            
            const data = await response.json();

            if (!response.ok || !data.success) {
                // If response.ok is false or success in body is false
                const errorMessage = data.message || `Failed to create department. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            toast.success(`Department "${trimmedName}" created successfully!`, { position: "bottom-right" });
            
            // Reset form and close modal
            setDepartmentName('');
            onClose(); 

        } catch (error) {
            console.error("Error creating department:", error);
            toast.error(`Error: ${error.message || "Could not save department."}`, { position: "bottom-right" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Create New Department
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
                    <div>
                        <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-2">
                            Department Name
                        </label>
                        <input
                            type="text"
                            id="departmentName"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Software Development"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <Plus size={18} className="mr-1" />
                                    Save Department
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- 💻 Dashboard Component ---
function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* The Navbar component is rendered here, ensure it fetches and displays the new department after creation. */}
            <Navbar/> 

        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Super Admin Oversight ⚙️
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Central management and alignment overview for all departments and processes.
                    </p>
                </div>
                
                {/* Create Department Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white 
                               font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                >
                    <Plus size={20} className="mr-2" />
                    Create Department
                </button>
            </header>
            
            ---
            
            {/* Stats Grid (Simplified rendering for example) */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {ADMIN_STATS_DATA.map(stat => (
                    <div key={stat.id} className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>
            
            ---

            {/* Main Content: Alignment and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Alignment & Performance Chart (Placeholder) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                        Department Alignment Score
                    </h2>
                    <div className="h-96 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <TrendingUp size={48} className="text-gray-400 mb-3" />
                        <p className="text-gray-600 font-semibold">
                            [Placeholder for Alignment Heatmap/Scorecard]
                        </p>
                    </div>
                </div>

                {/* 2. Recent Admin Activity (Placeholder) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                        System Logs & Admin Actions
                    </h2>
                    <ul className="h-96 overflow-y-auto">
                        {RECENT_ADMIN_ACTIVITY.map(activity => (
                            <li key={activity.id} className="py-3 border-b text-sm">
                                {activity.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* The Modal */}
            <CreateDepartmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
        </>
    );
}

export default Dashboard;