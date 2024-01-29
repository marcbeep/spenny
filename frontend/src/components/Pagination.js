import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const buttonStyle = {
    fontSize: '0.8rem',
  };

  const textStyle = {
    fontSize: '0.8rem',
  };

  return (
    <div className='pagination' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='btn'
        style={buttonStyle}
      >
        <FontAwesomeIcon icon={faChevronLeft} size='sm' />
      </button>

      <span style={textStyle}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='btn'
        style={buttonStyle}
      >
        <FontAwesomeIcon icon={faChevronRight} size='sm' />
      </button>
    </div>
  );
};

export default Pagination;
