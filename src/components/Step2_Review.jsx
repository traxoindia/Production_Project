// src/components/Step2_Review.jsx
import React from 'react';
import { useFormContext } from '../context/FormContext';
import { FileText, CheckCircle, Banknote } from 'lucide-react';

const Step2_Review = ({ prevStep, completeForm }) => {
    const { formData, updateFormData } = useFormContext();

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update the global state directly for the final step
        updateFormData({ [name]: value });
    };

    const DataRow = ({ label, value }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-800">{value}</span>
        </div>
    );
    
    // Calculate Estimated Amount based on fields from Step 1
    const estimatedAmount = (formData.deviceMrp || 0) * (formData.numberOfDevices || 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <FileText size={22} className="text-blue-600" />
                Step 2: Bank Guarantee & Review
            </h3>

            {/* Manufacturer and Device Review */}
            <div className="mb-6 border p-4 rounded-md bg-gray-50">
                <h4 className="font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Review Submitted Details
                </h4>
                <DataRow label="Manufacturer Name" value={formData.manufacturerName} />
                <DataRow label="Device Model" value={formData.deviceModel} />
                <DataRow label="Device MRP (₹)" value={formData.deviceMrp.toLocaleString('en-IN')} />
                <DataRow label="Number of Devices" value={formData.numberOfDevices} />
                <DataRow 
                    label="Estimated Total Value (₹)" 
                    value={estimatedAmount.toLocaleString('en-IN')} 
                />
            </div>

            {/* Bank Guarantee Form Section (Similar to your screenshot) */}
            <div className="mb-6 border p-4 rounded-md bg-blue-50">
                <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                    <Banknote size={18} />
                    Performance Bank Guarantee Details
                </h4>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name of the Account Holder</label>
                    <input
                        type="text"
                        name="accountHolder"
                        value={formData.accountHolder}
                        onChange={handleChange}
                        placeholder="Transport Commissioner"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="UCO Bank"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-between">
                <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
                >
                    ← Back (Step 1)
                </button>
                <button
                    type="button"
                    onClick={() => {
                        // Final save before completing
                        if (formData.accountHolder && formData.bankName) {
                            completeForm();
                        } else {
                            alert("Please fill in Bank Guarantee details.");
                        }
                    }}
                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                >
                    Submit Performance Guarantee
                </button>
            </div>
        </div>
    );
};

export default Step2_Review;