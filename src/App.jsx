// App.jsx (Main Application File)
import React, { useState } from 'react';
import { FormProvider, useFormContext } from './context/FormContext';
import Stepper from './components/Stepper';
import Step1_FormDetails from './components/Step1_FormDetails';
import Step2_Review from './components/Step2_Review';
import { CheckCheck } from 'lucide-react';
import Navbar from './pages/Navbar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from './pages/Login';

const FormContainer = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isComplete, setIsComplete] = useState(false);
    const { formData } = useFormContext();

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const completeForm = () => {
        setIsComplete(true);
        // In a real app, you would send formData to the API here
        console.log("--- Final Form Data Submitted ---");
        console.log(formData);
        console.log("---------------------------------");
    };

    const renderStep = () => {
        if (isComplete) {
            return (
                <div className="text-center bg-green-100 p-10 rounded-xl shadow-lg border border-green-300">
                    <CheckCheck size={64} className="text-green-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-green-700">Empanelment Complete!</h2>
                    <p className="mt-3 text-lg text-green-600">
                        Performance Bank Guarantee successfully submitted.
                    </p>
                    <pre className="mt-6 p-4 bg-white border rounded text-left text-sm text-gray-800 overflow-auto">
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return <Step1_FormDetails nextStep={nextStep} />;
            case 2:
                return <Step2_Review prevStep={prevStep} completeForm={completeForm} />;
            default:
                return <div>Invalid Step</div>;
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-100 py-10">

                <div className="max-w-4xl mx-auto px-4">


                    <Stepper currentStep={currentStep} />

                    <div className="mt-8">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </>
    );
};


// Main App export that includes the FormProvider
export default function App() {
    return (
        <FormProvider>
           
            <Routes>
            <Route path='/test' element={ <FormContainer />}/>
              
                <Route path="/" element={<Login />} />
            </Routes>
        </FormProvider>
    );
}