import React from 'react';

const Card = ({ onClick, title, subtitle, buttonText, onButtonClick, badgeText }) => {
  return (
    <div
      onClick={onClick}
      className='card cursor-pointer p-4 m-2 border-2 border-black bg-transparent'
    >
      <div className='card-body'>
        <h2 className='card-title'>{title}</h2>
        <h1>{subtitle}</h1>
        {badgeText && <div className='badge badge-outline'>{badgeText}</div>}
        {buttonText && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents the card's onClick from being triggered
              onButtonClick();
            }}
            className='btn'
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
