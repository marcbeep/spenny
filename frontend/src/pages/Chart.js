import React from 'react';
import AreaChart from './ChartComponent';

const Chart = () => {
  // Define dimensions for the chart
  const chartWidth = 600;
  const chartHeight = 400;

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl font-black">networth</h1>
          <AreaChart width={chartWidth} height={chartHeight} />
        </div>
      </div>
    </div>
  );
};

export default Chart;
