import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-black mt-0 mb-2">
          It's your money.
        </h1>
        <h2 className="text-3xl mb-8 font-bold">
          You decide what it does.
        </h2>
        <img
          src="https://images.pexels.com/photos/6207714/pexels-photo-6207714.jpeg" 
          alt="Finance Management"
          className="w-full max-w-lg rounded-lg shadow-md mb-8"
        />
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link to="/signup" className="btn btn-primary">
            Sign Up
          </Link>
          <Link to="/login" className="btn btn-outline">
            Log In
          </Link>
        </div>
        <p className="max-w-md">
          Spenny is a zero-based budgeting tool designed to help you keep track of every dollar you earn and spend. Plan for essentials, cut out unnecessary expenses, and start saving more every month.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
