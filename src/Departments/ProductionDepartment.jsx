import React, { useState, useEffect } from 'react';
import { Plus, X, Phone, Mail, User, Briefcase, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../pages/Navbar';

// --- API Endpoints ---
const CREATE_HEAD_API = "https://vanaras.onrender.com/api/v1/superadmin/createHeadADepartment";
const FETCH_HEADS_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllHeadDepartment";

// The exact string we expect in the API response's DepartmentName field
const CURRENT_DEPARTMENT_NAME_FILTER = "Production Department"; 
const CURRENT_DEPARTMENT_NAME_DISPLAY = 'Production Department'; 

// --- 🧱 Modal Component: CreateHeadModal ---
const CreateHeadModal = ({ isOpen, onClose, onHeadCreated, departmentName }) => {
    const [formData, setFormData] = useState({ 
        departmentHeadName: '', 
        email: '', 
        mobile: '' 
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { departmentHeadName, email, mobile } = formData;
        if (!departmentHeadName || !email || !mobile) {
            toast.error("All fields are required.", { position: "bottom-right" });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Authentication token is missing.", { position: "bottom-right" });
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                // Keys match the required API input fields:
                DepartmentHeadName: departmentHeadName, 
                email: email,
                mobile: mobile,
                // Sending the exact string required by the filter/API
                DepartmentName: CURRENT_DEPARTMENT_NAME_FILTER 
            };
            
            const response = await fetch(CREATE_HEAD_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage = data.message || `Failed to create department head. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            toast.success(`Head of ${departmentName}, "${departmentHeadName}", created successfully!`, { position: "bottom-right" });
            
            onHeadCreated(); // Refresh parent table
            setFormData({ departmentHeadName: '', email: '', mobile: '' });
            onClose(); 

        } catch (error) {
            console.error("Error creating department head:", error);
            toast.error(`Error: ${error.message || "Could not save department head."}`, { position: "bottom-right" });
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
                        <Briefcase size={20} /> Create Department Head
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
                    <p className="text-sm text-gray-600 mb-4">
                        Creating Head for: <span className="font-semibold text-indigo-700">{departmentName}</span>
                    </p>
                    <div className="space-y-4">
                        {/* Head Name (DepartmentHeadName) */}
                        <div>
                            <label htmlFor="departmentHeadName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    id="departmentHeadName"
                                    name="departmentHeadName"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Jane Doe"
                                    value={formData.departmentHeadName}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="jane.doe@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Mobile No. */}
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    id="mobile"
                                    name="mobile"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 9876543210"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
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
                                    Save Head
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- 💻 Main Component: ProductionDepartment ---
function ProductionDepartment() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [heads, setHeads] = useState([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // Function to fetch Department Heads
    const fetchDepartmentHeads = async () => {
        setLoadingTable(true);
        const token = localStorage.getItem("token");

        if (!token) {
             console.error("Token missing. Cannot fetch Department Heads.");
             setHeads([]);
             setLoadingTable(false);
             return;
        }

        try {
            const response = await fetch(FETCH_HEADS_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch department heads: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            
            // Check if the 'head' array exists and is an array
            if (data.head && Array.isArray(data.head)) {
                // **FILTERING RESTORED:** Filter heads where DepartmentName matches "Production Department"
                const fetchedHeads = data.head
                    .filter(head => head.DepartmentName === CURRENT_DEPARTMENT_NAME_FILTER)
                    .map(head => ({
                        id: head._id,
                        name: head.DepartmentHeadName,
                        email: head.email,
                        mobile: head.mobile,
                        // Include DepartmentName for display, though it will match the filter
                        DepartmentName: head.DepartmentName, 
                        status: 'Active', 
                    }));
                
                setHeads(fetchedHeads);
            } else {
                console.error("API response structure is incorrect: missing 'head' array or array is empty.");
                setHeads([]);
            }
            
        } catch (error) {
            console.error("Error fetching Department Heads:", error);
            toast.error(`Error loading Department Heads: ${error.message}.`, { position: "top-right" });
            setHeads([]); 
        } finally {
            setLoadingTable(false);
        }
    };

    // Fetch heads when the component mounts or when refreshTrigger changes
    useEffect(() => {
        fetchDepartmentHeads();
    }, [refreshTrigger]);


    return (
        <>
            <Navbar/>
        
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header and Button */}
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Briefcase size={30} className="text-indigo-600" />
                        {CURRENT_DEPARTMENT_NAME_DISPLAY} Management
                    </h1>
                    
                    {/* Create Head Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white 
                                   font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    >
                        <Plus size={20} className="mr-2" />
                        Create Head
                    </button>
                </header>
                
                {/* --- Heads Table UI --- */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {CURRENT_DEPARTMENT_NAME_DISPLAY} In-charge List ({heads.length})
                        </h2>
                        <button 
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                            disabled={loadingTable}
                        >
                            {loadingTable ? 'Refreshing...' : 'Refresh List'}
                        </button>
                    </div>
                    
                    {loadingTable ? (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2">Loading Department Heads...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {heads.length > 0 ? (
                                        heads.map((head) => (
                                            <tr key={head.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{head.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{head.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{head.mobile}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{head.DepartmentName || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                                        {head.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No Department Head found for {CURRENT_DEPARTMENT_NAME_DISPLAY}. Click 'Create Head' to add one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
            {/* The Modal */}
            <CreateHeadModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onHeadCreated={() => setRefreshTrigger(prev => prev + 1)} 
                departmentName={CURRENT_DEPARTMENT_NAME_DISPLAY} 
            />
        </div>
        </>
    );
}

export default ProductionDepartment;