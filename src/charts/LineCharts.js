import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LineCharts = ({ data, selectedColumns, showChart }) => {
  if (!showChart) return null;

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Line Chart Visualization</h3>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {selectedColumns.map((col, index) => (
          <Line
            key={col}
            type="monotone"
            dataKey={col}
            stroke={`hsl(${index * 60}, 70%, 50%)`}
            strokeWidth={2}
            dot={{ r: 0.5 }}
          />
        ))}
      </LineChart>
    </div>
  );
};

export default LineCharts;
