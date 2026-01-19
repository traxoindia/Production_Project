import React from 'react';
import DepartmentPage from './DepartmentPage'; // Adjust path as needed

// Must match the API DepartmentName field: "Software Department"
const SOFTWARE_DEPARTMENT_NAME = "Software Department"; 

function SoftwareDepartment() {
  return (
    <DepartmentPage departmentName={SOFTWARE_DEPARTMENT_NAME} />
  );
}

export default SoftwareDepartment;