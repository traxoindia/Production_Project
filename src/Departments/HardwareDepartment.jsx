import React from 'react';
import DepartmentPage from './DepartmentPage'; // Adjust path as needed

// Must match the API DepartmentName field: "Hardware Department"
const HARDWARE_DEPARTMENT_NAME = "Hardware Department"; 

function HardwareDepartment() {
  return (
    <DepartmentPage departmentName={HARDWARE_DEPARTMENT_NAME} />
  );
}

export default HardwareDepartment;