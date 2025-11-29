// HrDepartment.jsx
import React from 'react';
import DepartmentPage from './DepartmentPage'; // Adjust import path as necessary

// The exact string that matches the DepartmentName in your API response
const HR_DEPARTMENT_NAME = "Hr Department"; 

function HrDepartment() {
  return (
    <DepartmentPage departmentName={HR_DEPARTMENT_NAME} />
  );
}

export default HrDepartment;