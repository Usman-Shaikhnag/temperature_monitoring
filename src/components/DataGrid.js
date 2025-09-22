import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
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
    <div className="ag-theme-quartz-dark" style={{ height: '450px', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        onGridReady={onGridReady}
        rowSelection="multiple"
        cellSelection={true}
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10,20]}
        rowHeight={40}
      />
    </div>
  );
};

export default DataGrid;
