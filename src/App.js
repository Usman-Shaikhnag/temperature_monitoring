import React, { useState ,useRef} from 'react';
import ExcelImporter from './components/ExcelImporter';
import ColumnSelector from './components/ColumnSelector';
import ColumnManager from './components/ColumnManager';
import DataGrid from './components/DataGrid';
import LineCharts from './charts/LineCharts';
import WordReport from './components/WordReport';

const App = () => {
  const [rowData, setRowData] = useState([]);

  const [columnDefs, setColumnDefs] = useState([
    { field: 'thermocouple1_bottom', headerName: 'Thermocouple 1 (Bottom)', editable: true, type: 'textColumn' },
    { field: 'thermocouple2_middle', headerName: 'Thermocouple 2 (Middle)', editable: true, type: 'textColumn' },
    { field: 'thermocouple3_top', headerName: 'Thermocouple 3 (Top)', editable: true, type: 'textColumn' },
    { field: 'thermocouple1_standby1', headerName: 'Thermocouple 4 (Standby 1)', editable: true, type: 'textColumn' },
    { field: 'thermocouple1_standby2', headerName: 'Thermocouple 5 (Standby 2)', editable: true, type: 'textColumn' },
    {
      field: 'temperature_differential',
      headerName: 'Temperature Differential 1',
      editable: false,
      type: 'numericColumn',
      valueGetter: params => {
        const q = parseFloat(params.data?.thermocouple2_middle) || 0;
        const p = parseFloat(params.data?.thermocouple3_top) || 0;
        return Math.abs(q - p);
      },
      valueFormatter: params => `${params.value?.toFixed(2) || '0.00'}`
    }
  ]);

  const [selectedColumns1, setSelectedColumns1] = useState([]);
  const [showChart1, setShowChart1] = useState(false);

  const [selectedColumns2, setSelectedColumns2] = useState([]);
  const [showChart2, setShowChart2] = useState(false);

  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);

  const [gridApi, setGridApi] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onDataImported = ({ data, columnDefs: cols }) => {
    setRowData(data);
    setColumnDefs(cols);
    setSelectedColumns1([]);
    setShowChart1(false);
    setSelectedColumns2([]);
    setShowChart2(false);
  };

  // Add new row (including formulas)
  const addRow = () => {
    const newRow = {};
    
    columnDefs.forEach(col => {
      if (!col.valueGetter) {
        newRow[col.field] = col.type === 'numericColumn' ? 0 : '';
      }
    });
    
    columnDefs.forEach(col => {
      if (col.valueGetter) {
        try {
          const mockParams = { data: newRow };
          const calculatedValue = col.valueGetter(mockParams);
          newRow[col.field] = calculatedValue;
        } catch {
          newRow[col.field] = 0;
        }
      }
    });
    
    setRowData(prev => {
      const newData = [...prev, newRow];
      setTimeout(() => {
        if (gridApi) gridApi.refreshCells({ force: true });
      }, 100);
      return newData;
    });
  };

  // Add new column
  const onColumnAdded = (newColumnDef) => {
    setColumnDefs(prev => [...prev, newColumnDef]);
    setRowData(prev => prev.map(row => {
      const updatedRow = { ...row };
      if (newColumnDef.valueGetter) {
        try {
          const mockParams = { data: updatedRow };
          updatedRow[newColumnDef.field] = newColumnDef.valueGetter(mockParams);
        } catch {
          updatedRow[newColumnDef.field] = 0;
        }
      } else {
        updatedRow[newColumnDef.field] = newColumnDef.type === 'numericColumn' ? 0 : '';
      }
      return updatedRow;
    }));
  };

  const onColumnUpdated = (updatedColumnDefs) => {
    setColumnDefs(updatedColumnDefs);
  };

  // Cell value changes → recalc formulas
  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    updatedRowData[params.rowIndex] = { ...params.data };

    columnDefs.forEach(col => {
      if (col.valueGetter) {
        try {
          const mockParams = { data: updatedRowData[params.rowIndex] };
          const calculatedValue = col.valueGetter(mockParams);
          updatedRowData[params.rowIndex][col.field] = calculatedValue;
        } catch {
          updatedRowData[params.rowIndex][col.field] = 0;
        }
      }
    });

    setRowData(updatedRowData);

    const formulaColumns = columnDefs.filter(col => col.valueGetter).map(col => col.field);
    if (formulaColumns.length > 0) {
      setTimeout(() => {
        params.api.refreshCells({
          rowNodes: [params.node],
          columns: formulaColumns,
          force: true
        });
      }, 0);
    }

    
  };

  // Chart data generator
  const getChartData = (selectedCols) => {
    if (selectedCols.length === 0) return [];

    return rowData.map((row, index) => {
      const chartRow = { name: `Row ${index + 1}` };

      selectedCols.forEach(col => {
        let value = row[col];
        if ((value === undefined || value === null) && columnDefs) {
          const columnDef = columnDefs.find(c => c.field === col);
          if (columnDef && columnDef.valueGetter) {
            try {
              const mockParams = { data: row };
              value = columnDef.valueGetter(mockParams);
            } catch {
              value = 0;
            }
          }
        }
        chartRow[col] = parseFloat(value) || 0;
      });

      return chartRow;
    });
  };

  const exportChartAsImage = (chartRef) => {
    const svg = chartRef.current.querySelector("svg");
    if (!svg) return null;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = svg.clientWidth;
        canvas.height = svg.clientHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png")); // base64 PNG
      };
      img.src = url;
    });
  };

  // const handleSubmit = async ()=>{
  //   try {
  //     console.log(rowData)
  //     debugger;
  //     const req_body = {
  //       "columns":columnDefs,
  //       "rows":rowData
  //     }
  //     const resp = await fetch('http://localhost:8069/create_temp_mon', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(req_body), // Send rowData from state
  //     });
  //     if (!resp.ok) {
  //       throw new Error(`HTTP error! Status: ${resp.status}`);
  //     }
  //     const data = await resp.json();
  //     console.log('Response:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('Fetch error:', error);
  //     throw error;
  //   }
  // }
  const handleSubmit = async () => {
  try {
    const chart1Image = await exportChartAsImage(chart1Ref);
    const chart2Image = await exportChartAsImage(chart2Ref);

    const req_body = {
      columns: columnDefs,
      rows: rowData,
      chart1: chart1Image, // base64 string
      chart2: chart2Image
    };

    const resp = await fetch("http://localhost:8069/create_temp_mon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req_body),
    });

    if (!resp.ok) {
      throw new Error(`HTTP error! Status: ${resp.status}`);
    }
    const data = await resp.json();
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Temperature Monitoring</h2>
      <WordReport rows={rowData} columns={columnDefs}/>
      <ExcelImporter onDataImported={onDataImported} />

      <ColumnManager 
        columnDefs={columnDefs} 
        onColumnAdded={onColumnAdded}
        onColumnUpdated={onColumnUpdated}
      />

      <ColumnSelector
        columnDefs={columnDefs}
        onColumnsSelected={(cols) => {
          setSelectedColumns1(cols);
          setShowChart1(cols.length > 0);
        }}
      />

      <ColumnSelector
        columnDefs={columnDefs}
        onColumnsSelected={(cols) => {
          setSelectedColumns2(cols);
          setShowChart2(cols.length > 0);
        }}
      />

      <button 
        onClick={addRow} 
        style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', marginRight: '10px' }}
      >
        Add Row
      </button>

      <DataGrid
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        onGridReady={onGridReady}
      />

      <LineCharts
        ref={chart1Ref}
        data={getChartData(selectedColumns1)}
        selectedColumns={selectedColumns1}
        showChart={showChart1}
      />

      <LineCharts
        ref={chart2Ref}
        data={getChartData(selectedColumns2)}
        selectedColumns={selectedColumns2}
        showChart={showChart2}
      />
      <button 
        onClick={handleSubmit} 
        style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', marginRight: '10px' }}
      >
        Submit
      </button>
    </div>
  );
};

export default App;
