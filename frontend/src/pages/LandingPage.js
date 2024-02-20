import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.3, duration: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className='min-h-screen'>
      <motion.div
        className='container mx-auto flex flex-col items-center justify-center text-center py-12'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.h1 className='text-3xl mb-8 font-bold max-w-xl' variants={itemVariants}>
          The ultra-simple money management tool to get your financial act together.
        </motion.h1>
        <motion.img
          src='https://images.pexels.com/photos/6207714/pexels-photo-6207714.jpeg'
          alt='Finance Management'
          className='w-full max-w-lg rounded-3xl shadow-xl mb-10'
          variants={itemVariants}
        />
        <div className='flex flex-wrap justify-center gap-6 mb-12'>
          <Link to='/login' className='btn btn-outline' variants={itemVariants}>
            Log In
          </Link>
          <Link to='/signup' className='btn btn-primary' variants={itemVariants}>
            Sign Up
          </Link>
        </div>
        <motion.p className='max-w-xl mb-12' variants={itemVariants}>
          Spenny is a zero-based budgeting tool designed to help you keep track of every dollar you
          earn and spend. Plan for essentials, cut out unnecessary expenses, and start saving more
          every month.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
