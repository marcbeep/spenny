import React from 'react';
import { useAuth } from '../../../hooks/useAuth'; 

const Placeholder = () => {
  const { user } = useAuth(); 
  
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Thanks for visiting {user.email}</h2>
            <p>Spenny is currently under construction.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
