// App.jsx
import React, { useState } from 'react';
import { FormProvider } from './context/FormContext';
import Stepper from './components/Stepper';
import Step1_FormDetails from './components/Step1_FormDetails';
import Step2_Review from './components/Step2_Review';
import { CheckCheck } from 'lucide-react';
import Navbar from './pages/Navbar';
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from "./ProtectedRoute";
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Manage from './Superadmin/Manage';
import Dashboard from './Superadmin/Dashboard';
import ProductionDepartment from './Departments/ProductionDepartment';
import Navbar1 from './pages/Navbar1';
import DepartmentPage from './Departments/DepartmentPage';
import HardwareDepartment from './Departments/HardwareDepartment';
import AccountsFinanceDepartment from './Departments/AccountsFinanceDepartment';
import SoftwareDepartment from './Departments/SoftwareDepartment';
import ServicesOperationDepartment from './Departments/ServicesOperationDepartment';
import HrDepartment from './Departments/HrDepartment';
import EmployeeList from './pages/EmployeeList';
import AssignWork from './pages/AssignWork';
import Navbar3 from './pages/Navbar3';
import AssignWork1 from './pages/AssignWork1';
import Work from './pages/Work';
import Team from './pages/Team';
import Reports from './pages/Reports';

// ----------------------------
// FORM CONTAINER COMPONENT
// ----------------------------
const FormContainer = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isComplete, setIsComplete] = useState(false);

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const completeForm = () => {
        setIsComplete(true);
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
            <Navbar3/>

            <div className="min-h-screen bg-gray-100 py-10">
                <div className="max-w-4xl mx-auto px-4">
                    <Stepper currentStep={currentStep} />
                    <div className="mt-8">{renderStep()}</div>
                </div>
            </div>
        </>
    );
};

// ----------------------------
// MAIN APP COMPONENT
// ----------------------------
export default function App() {
    return (
        <FormProvider>
            <Routes>

                {/* PROTECTED ROUTE */}
                <Route
                    path="/employees/ProductionDepartment"
                    element={
                        <ProtectedRoute>
                            <FormContainer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/superadmin"
                    element={
                        <ProtectedRoute>
                            <Manage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/superadmin/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/departments/account-&-finance-department"
                    element={
                        <ProtectedRoute>
                            <AccountsFinanceDepartment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/departments/software-department"
                    element={
                        <ProtectedRoute>
                            <SoftwareDepartment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/departments/production-department"
                    element={
                        <ProtectedRoute>
                            <ProductionDepartment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/departments/services-&-operation-department"
                    element={
                        <ProtectedRoute>
                            <ServicesOperationDepartment />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/departments/hr-department"
                    element={
                        <ProtectedRoute>
                            <HrDepartment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employees"
                    element={
                        <ProtectedRoute>
                            <EmployeeList />
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/assignwork"
                    element={
                        <ProtectedRoute>
                            <AssignWork />
                        </ProtectedRoute>
                    }
                />
                  <Route
                    path="/assignworkProduction"
                    element={
                        <ProtectedRoute>
                            <AssignWork1 />
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/work"
                    element={
                        <ProtectedRoute>
                            <Work />
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/superadmin/team"
                    element={
                        <ProtectedRoute>
                            <Team />
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />
                
                {/* PUBLIC LOGIN */}
                <Route path="/" element={<Login />} />

            </Routes>

            <ToastContainer position="top-right" autoClose={4000} />
        </FormProvider>
    );
}
