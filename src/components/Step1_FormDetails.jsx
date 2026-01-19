// src/components/Step1_FormDetails.jsx
import React, { useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { Upload, HardHat } from 'lucide-react';

const Step1_FormDetails = ({ nextStep }) => {
    const { formData, updateFormData } = useFormContext();
    const [localData, setLocalData] = useState(formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 1. Update the global context state
        updateFormData(localData);
        // 2. Move to the next step
        nextStep();
    };

    const InputField = ({ icon: Icon, label, name, type = 'text' }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Icon size={16} className="text-indigo-500" />
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={localData[name]}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <Upload size={22} className="text-green-600" />
                Step 1: Manufacturer & Device Details
            </h3>

            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <h4 className="font-semibold text-indigo-600 mb-3">Manufacturer Info</h4>
                    <InputField icon={Upload} label="Manufacturer Name" name="manufacturerName" />
                    <InputField icon={Upload} label="PAN Number" name="panNumber" />
                    <InputField icon={Upload} label="GSTIN" name="gstin" />
                </div>
                
                <div className="col-span-2">
                    <h4 className="font-semibold text-indigo-600 mb-3">Device Specs</h4>
                    <InputField icon={HardHat} label="Device Model" name="deviceModel" />
                    <InputField icon={HardHat} label="Device MRP (₹)" name="deviceMrp" type="number" />
                    <InputField icon={HardHat} label="Number of Devices" name="numberOfDevices" type="number" />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                    Save & Next (Step 2)
                </button>
            </div>
        </form>
    );
};

export default Step1_FormDetails;