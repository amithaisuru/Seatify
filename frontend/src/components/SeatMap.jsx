import React from 'react';

const SeatMap = ({ seats }) => {
  return (
    <div className="relative w-[500px] h-[400px] border bg-gray-100 rounded-md overflow-hidden">
      {seats.map((seat, index) => (
        <div
          key={index}
          className={`absolute w-6 h-6 rounded-sm text-xs flex items-center justify-center 
            ${seat.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'} text-white`}
          style={{
            left: `${seat.x}px`,
            top: `${seat.y}px`,
          }}
          title={`Seat ${seat.label}`}
        >
          {seat.label}
        </div>
      ))}
    </div>
  );
};

export default SeatMap;
