import React from 'react';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const DownloadChart = () => {
  const data = {
    labels: Array.from({ length: 20 }, (_, i) => i + 1),
    datasets: [{
      label: 'Downloads',
      data: [6, 5, 2, 11, 13, 16, 14, 14, 14, 15, 18, 16, 18, 15, 19, 16, 20, 18, 12, 14],
      fill: true,
      backgroundColor: 'rgba(25, 214, 191, 0.2)',
      borderColor: '#19D6BF',
      pointRadius: 0,
      borderWidth: 2,
    }]
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          drawBorder: false,
        },
      },
      y: {
        display: false,
        grid: {
          drawBorder: false,
        },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    // Adjust the card's size here with custom width and height
    <div style={{ maxWidth: '300px', height: '200px', margin: 'auto' }} className="card bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <h2 className="card-title text-sm">19,000</h2>
        <p className="text-xs">Downloads</p>
        <div style={{ position: 'relative', height: '100%' }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DownloadChart;
