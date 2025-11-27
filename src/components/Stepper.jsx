// src/components/Stepper.jsx
import React from 'react';
import { CheckCircle, Upload, HardHat, FileText } from 'lucide-react';


const steps = [
    { name: 'Upload Documents', icon: Upload },
    { name: 'Device Details', icon: HardHat },
    { name: 'Bank Guarantee', icon: FileText },
    { name: 'Review', icon: CheckCircle },
];

const Stepper = ({ currentStep }) => {
    return (
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md mb-8">
       
            {steps.map((step, index) => {
                const stepIndex = index + 1;
                const isActive = stepIndex === currentStep;
                const isCompleted = stepIndex < currentStep;

                let iconColor = 'text-gray-400';
                let circleBg = 'bg-gray-100';
                let circleText = 'text-gray-500';
                let barColor = 'bg-gray-200';

                if (isActive) {
                    iconColor = 'text-indigo-600';
                    circleBg = 'bg-indigo-600';
                    circleText = 'text-white';
                } else if (isCompleted) {
                    iconColor = 'text-green-600';
                    circleBg = 'bg-green-600';
                    circleText = 'text-white';
                    barColor = 'bg-indigo-300';
                }

                return (
                    <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center flex-1 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circleBg} ${circleText} font-bold transition-colors duration-300 shadow-md`}>
                                {isCompleted ? <CheckCircle size={20} /> : <step.icon size={20} />}
                            </div>
                            <span className={`mt-2 text-xs text-center font-medium ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}>
                                {step.name}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${barColor} ${isCompleted ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors duration-500`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Stepper;