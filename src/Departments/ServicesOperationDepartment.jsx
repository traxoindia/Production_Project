import React from 'react';
import DepartmentPage from './DepartmentPage'; // Adjust path as needed

// Must match the API DepartmentName field: "Services & Operation Department"
const SERVICES_OPERATION_DEPARTMENT_NAME = "Services & Operation Department"; 

function ServicesOperationDepartment() {
  return (
    <DepartmentPage departmentName={SERVICES_OPERATION_DEPARTMENT_NAME} />
  );
}

export default ServicesOperationDepartment;