import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar1 from './Navbar1';
import ProductList from './ProductList';

// --- API Endpoint for fetching all employees ---
const FETCH_EMPLOYEES_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllEmployee";

// --- 💻 Main Component: EmployeeList ---
function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to fetch all Employees
    const fetchEmployees = async () => {
        setLoadingTable(true);
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Token missing. Cannot fetch Employees.");
            setEmployees([]);
            setLoadingTable(false);
            return;
        }

        try {
            const response = await fetch(FETCH_EMPLOYEES_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch employees: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched Employee Data:", data);

            // --- DATA MAPPING CORRECTION ---
            // Correctly access the array using data.emp
            if (data.emp && Array.isArray(data.emp)) {
                const fetchedEmployees = data.emp
                    .map(emp => ({
                        id: emp._id,
                        name: emp.empName || 'N/A',
                        email: emp.empEmail || 'N/A',
                        mobile: emp.empMobile || 'N/A',
                        // The department info isn't directly available in the emp object 
                        // in your provided data, so we set a placeholder for now.
                        // You might need a separate API call to link emp to DepartmentHead to DepartmentName
                        department: 'Assigned Head: ' + (emp.departmentHeadId ? 'Yes' : 'No'),
                        // Assuming 'Active' as default status since no isActive field is present
                        status: 'Active',
                    }));

                setEmployees(fetchedEmployees);
            } else {
                console.error("API response structure is incorrect: missing 'emp' array.");
                setEmployees([]);
            }

        } catch (error) {
            console.error("Error fetching Employees:", error);
            toast.error(`Error loading employees: ${error.message}.`, { position: "top-right" });
            setEmployees([]);
        } finally {
            setLoadingTable(false);
        }
    };

    // Fetch employees when the component mounts or when refreshTrigger changes
    useEffect(() => {
        fetchEmployees();
    }, [refreshTrigger]);


    return (
        <>
            <Navbar1 />
            <div className=''>
                <ProductList />
            </div>
            

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 -mt-80">
                <div className="max-w-7xl mx-auto">

                    {/* Header and Button */}
                    <header className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <User size={30} className="text-blue-600" />
                            My Employees List
                        </h1>

                        {/* Optional: Add Employee Button (If you don't use the Navbar button) */}
                        <button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white 
                                       font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                            disabled={loadingTable}
                        >
                            <RefreshCw size={20} className={`mr-2 ${loadingTable ? 'animate-spin' : ''}`} />
                            Refresh List
                        </button>
                    </header>

                    {/* --- Employees Table UI --- */}
                    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                        <div className="p-5 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Total Employees ({employees.length})
                            </h2>
                        </div>

                        {loadingTable ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2">Fetching employee data...</p>
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
                                        {employees.length > 0 ? (
                                            employees.map((emp) => (
                                                <tr key={emp.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        <User size={16} className="text-gray-400" />
                                                        {emp.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.mobile}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                        >
                                                            {emp.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                                        <button className="text-red-600 hover:text-red-900">Suspend</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    No employees found.
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
        </>
    );
}

export default EmployeeList;