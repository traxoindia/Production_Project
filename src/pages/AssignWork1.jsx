// EmployeeWorkList.jsx

import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar3 from '../pages/Navbar3';

const FETCH_EMPLOYEE_WORK_LIST_API =
  "https://vanaras.onrender.com/api/v1/superadmin/FetchLoginEmployeeWorkList";

function AssignWork1() {
  const [employeeData, setEmployeeData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchWorkList = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication required.", { position: "top-center" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(FETCH_EMPLOYEE_WORK_LIST_API, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch work list: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Work List Data:", data);

      // Correct mapping for given data structure
      if (data.emp) {
        setEmployeeData(data.emp);

        if (Array.isArray(data.emp.assignWork)) {
          const updatedAssignments = data.emp.assignWork.map((assignment) => ({
            id: assignment._id,
            taskTitle: assignment.workTitel || "No Title",
            task: assignment.workDescription || "No Description",
            assignedDate: new Date(assignment.createdAt).toLocaleDateString(),
            status: assignment.status ? "Completed" : "Pending",
          }));

          setAssignments(updatedAssignments);
        } else {
          setAssignments([]);
        }
      } else {
        setEmployeeData(null);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error(`Error loading work list: ${error.message}`, {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkList();
  }, [refreshTrigger]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const employeeName = employeeData?.empName || "Employee";

  return (
    <>
      <Navbar3 />

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <User size={30} className="text-blue-600" />
              {employeeName}'s Work List
            </h1>

            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white 
              font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Loading..." : "Refresh List"}
            </button>
          </header>

          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                My Assigned Tasks ({assignments.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <p>Fetching your work assignments...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.length > 0 ? (
                      assignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {assignment.taskTitle}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            {assignment.task}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {assignment.assignedDate}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                assignment.status
                              )}`}
                            >
                              {assignment.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {assignment.status === "Pending" && (
                              <button className="text-green-600 hover:text-green-900">
                                Mark Done
                              </button>
                            )}
                            {assignment.status === "Completed" && (
                              <span className="text-gray-500 text-xs">
                                Complete
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          You currently have no outstanding work assignments.
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

export default AssignWork1;
