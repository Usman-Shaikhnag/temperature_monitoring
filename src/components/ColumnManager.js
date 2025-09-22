import React, { useState } from 'react';

const ColumnManager = ({ columnDefs, onColumnAdded, onColumnUpdated }) => {
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({
    field: '',
    headerName: '',
    type: 'textColumn',
    editable: true,
    isFormula: false,
    formula: ''
  });

  const handleAddColumn = () => {
    if (!newColumn.field || !newColumn.headerName) {
      alert('Please provide both field name and header name');
      return;
    }

    const columnConfig = {
      field: newColumn.field,
      headerName: newColumn.headerName,
      editable: !newColumn.isFormula,
      type: newColumn.type,
      flex: 1
    };

    // Add value formatter for numeric columns
    if (newColumn.type === 'numericColumn') {
      columnConfig.valueFormatter = params => {
        if (newColumn.field.includes('price') || newColumn.field.includes('total')) {
          return `$${params.value?.toFixed(2) || '0.00'}`;
        }
        return params.value?.toFixed(2) || '0.00';
      };
    }

    // Add formula logic if it's a calculated column
    if (newColumn.isFormula && newColumn.formula) {
      columnConfig.valueGetter = (params) => {
        try {
          // Simple formula parser - you can extend this
          let formula = newColumn.formula;
          
          // Replace field references with actual values
          const fieldMatches = formula.match(/\{(\w+)\}/g);
          if (fieldMatches) {
            fieldMatches.forEach(match => {
              const fieldName = match.replace(/[{}]/g, '');
              const value = parseFloat(params.data?.[fieldName]) || 0;
              formula = formula.replace(match, value);
            });
          }
          
          // Evaluate simple mathematical expressions
          // Warning: In production, use a proper expression parser for security
          return Function('"use strict"; return (' + formula + ')')();
        } catch (error) {
          console.error('Formula error:', error);
          return 0;
        }
      };
    }

    onColumnAdded(columnConfig);
    
    // Reset form
    setNewColumn({
      field: '',
      headerName: '',
      type: 'textColumn',
      editable: true,
      isFormula: false,
      formula: ''
    });
    setShowAddColumn(false);
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4>Column Management</h4>
        <button 
          onClick={() => setShowAddColumn(!showAddColumn)}
          style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          {showAddColumn ? 'Cancel' : 'Add Column'}
        </button>
      </div>

      {showAddColumn && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <div>
            <label>Field Name:</label>
            <input
              type="text"
              value={newColumn.field}
              onChange={(e) => setNewColumn(prev => ({ ...prev, field: e.target.value }))}
              placeholder="e.g., customField"
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </div>
          
          <div>
            <label>Header Name:</label>
            <input
              type="text"
              value={newColumn.headerName}
              onChange={(e) => setNewColumn(prev => ({ ...prev, headerName: e.target.value }))}
              placeholder="e.g., Custom Field"
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </div>

          <div>
            <label>Column Type:</label>
            <select
              value={newColumn.type}
              onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value }))}
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            >
              <option value="textColumn">Text</option>
              <option value="numericColumn">Number</option>
              <option value="dateColumn">Date</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
              <input
                type="checkbox"
                checked={newColumn.isFormula}
                onChange={(e) => setNewColumn(prev => ({ 
                  ...prev, 
                  isFormula: e.target.checked,
                  editable: !e.target.checked 
                }))}
                style={{ marginRight: '5px' }}
              />
              Computed Column
            </label>
          </div>

          {newColumn.isFormula && (
            <div style={{ gridColumn: 'span 2' }}>
              <label>Formula:</label>
              <input
                type="text"
                value={newColumn.formula}
                onChange={(e) => setNewColumn(prev => ({ ...prev, formula: e.target.value }))}
                placeholder="e.g., {quantity} * {price} or {temperature} - 32"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Use {'{fieldName}'} to reference other columns. Example: {'{quantity} * {price} + 10'}
              </small>
            </div>
          )}

          <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <button 
              onClick={handleAddColumn}
              style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', marginRight: '10px' }}
            >
              Add Column
            </button>
            <button 
              onClick={() => setShowAddColumn(false)}
              style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <small style={{ color: '#666' }}>
          Current columns: {columnDefs.map(col => col.headerName).join(', ')}
        </small>
      </div>
    </div>
  );
};

export default ColumnManager;
