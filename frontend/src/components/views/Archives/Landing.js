import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
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
    <div className='min-h-screen flex flex-col'>
      <motion.div
        className='container mx-auto flex flex-1 items-center justify-center p-12'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Text & CTA Container */}
        <div className='flex-1 flex flex-col items-start justify-center text-left max-w-lg space-y-6'>
          <motion.h1 className='text-3xl font-bold' variants={itemVariants}>
            The ultra-simple money management tool to get your financial act together.
          </motion.h1>
          <motion.p variants={itemVariants}>
            Spenny is a zero-based budgeting tool designed to help you keep track of every dollar
            you earn and spend. Plan for essentials, cut out unnecessary expenses, and start saving
            more every month.
          </motion.p>
          <div className='flex flex-wrap gap-6'>
            <Link to='/login' className='btn btn-outline' variants={itemVariants}>
              Log In
            </Link>
            <Link to='/signup' className='btn btn-primary' variants={itemVariants}>
              Sign Up
            </Link>
          </div>
        </div>

        {/* Image Container */}
        <motion.div className='flex-1 hidden lg:flex justify-end' variants={itemVariants}>
          <motion.img src='/landing-img.png' alt='Finance Management' className='max-w-md' />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
