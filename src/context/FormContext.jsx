// src/context/FormContext.jsx
import React, { createContext, useContext, useState } from 'react';

// Define the initial state structure based on what you want to collect
const initialFormData = {
    // Stage: Upload Documents
    manufacturerName: '',
    panNumber: '',
    gstin: '',
    
    // Stage: Device Details
    deviceModel: '',
    deviceMrp: 0,
    numberOfDevices: 0,
    
    // Stage: Bank Guarantee Info
    accountHolder: '',
    bankName: '',
};

// Create the Context
const FormContext = createContext();

// Custom hook to use the form data throughout the application
export const useFormContext = () => {
    return useContext(FormContext);
};

// Provider Component
export const FormProvider = ({ children }) => {
    const [formData, setFormData] = useState(initialFormData);

    // Function to update any field in the form data
    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const value = {
        formData,
        updateFormData
    };

    return (
        <FormContext.Provider value={value}>
            {children}
        </FormContext.Provider>
    );
};