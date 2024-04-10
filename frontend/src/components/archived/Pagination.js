import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className='pagination flex items-center gap-10'>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className='btn text-sm'
    >
      <FontAwesomeIcon icon={faChevronLeft} size='sm' />
    </button>

    <span className='text-sm'>
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className='btn text-sm'
    >
      <FontAwesomeIcon icon={faChevronRight} size='sm' />
    </button>
  </div>
);

export default Pagination;
