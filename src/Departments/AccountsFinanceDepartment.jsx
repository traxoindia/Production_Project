import React from 'react';
import DepartmentPage from './DepartmentPage'; // Adjust path as needed

// Must match the API DepartmentName field: "Account & Finance Department"
const ACCOUNTS_FINANCE_DEPARTMENT_NAME = "Account & Finance Department"; 

function AccountsFinanceDepartment() {
  return (
    <DepartmentPage departmentName={ACCOUNTS_FINANCE_DEPARTMENT_NAME} />
  );
}

export default AccountsFinanceDepartment;