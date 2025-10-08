import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';

import { ModuleRegistry, AllCommunityModule, themeMaterial, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

const DataGrid = ({ 
  rowData, 
  columnDefs, 
  onCellValueChanged, 
  onGridReady 
}) => {
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true
  }), []);

  return (
    <div style={{ height: '450px', width: '100%' }}>
      <AgGridReact
        theme={themeQuartz}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        onGridReady={onGridReady}
        rowSelection="multiple"
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10,20]}
        rowHeight={40}
        
        // ✅ Add tooltip configuration
        tooltipShowDelay={500}           // Show tooltip after 500ms
        tooltipHideDelay={10000}         // Hide after 10 seconds
        tooltipInteraction={true}        // Allow interaction with tooltip
      />
    </div>
  );
};

export default DataGrid;
