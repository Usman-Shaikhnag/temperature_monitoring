import React, { useState } from 'react';

const ColumnSelector = ({ columnDefs, onColumnsSelected }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);

  const numericColumns = columnDefs.filter(col =>
    col.type === 'numericColumn'
  );

  const handleColumnToggle = (fieldName) => {
    setSelectedColumns(prev => {
      const newSelection = prev.includes(fieldName)
        ? prev.filter(col => col !== fieldName)
        : [...prev, fieldName];
      onColumnsSelected(newSelection);
      return newSelection;
    });
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
      <h4>Select Columns for Graphing:</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {numericColumns.map(col => (
          <label key={col.field} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={selectedColumns.includes(col.field)}
              onChange={() => handleColumnToggle(col.field)}
              style={{ marginRight: '5px' }}
            />
            {col.headerName || col.field}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelector;
