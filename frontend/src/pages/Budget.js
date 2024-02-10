import React from 'react';
import { useBudgetContext } from '../context/BudgetContext';

const Budget = () => {

    const { readyToAssign } = useBudgetContext();
    
    return (
        <h1>Ready to assign: {readyToAssign}</h1>
    );
}

export default Budget;
