import React, { useState, useRef, useEffect } from 'react';
import ExcelImporter from './ExcelImporter';
import ColumnSelector from './ColumnSelector';
import ColumnManager from './ColumnManager';
import DataGrid from './DataGrid';
import LineCharts from '../charts/LineCharts';
import WordReport from './WordReport';
import html2canvas from 'html2canvas';
import styles from '../App.module.css';


const TemperatureMonitoring = () => {

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  console.log("Token",token)
    
  useEffect(()=> {
    fetch("http://localhost:8069/api/temp_monitoring/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        })
        .then(res => res.json())
        .then(data => {
            // debugger;
            if (data.result.valid) {
                if(data.result.columns_data){
                    // debugger;
                    setRowData(data.result.rows_data)
                }
                if(data.result.columns_data){
                    setColumnDefs(data.result.columns_data)
                }
            } else {
            console.error("Invalid Token:", data.error);
            }
        });

  },[])

  const [rowData, setRowData] = useState([]);  
  const [columnDefs, setColumnDefs] = useState([
    { 
      field: 'thermocouple1_bottom', 
      headerName: 'Thermocouple 1 (Bottom)', 
      headerTooltip: 'Field: thermocouple1_bottom', // ✅ Add this
      editable: true, 
      type: 'textColumn' 
    },
    { 
      field: 'thermocouple2_middle', 
      headerName: 'Thermocouple 2 (Middle)', 
      headerTooltip: 'Field: thermocouple2_middle', // ✅ Add this
      editable: true, 
      type: 'textColumn' 
    },
    { 
      field: 'thermocouple3_top', 
      headerName: 'Thermocouple 3 (Top)', 
      headerTooltip: 'Field: thermocouple3_top', // ✅ Add this
      editable: true, 
      type: 'textColumn' 
    },
    { 
      field: 'thermocouple1_standby1', 
      headerName: 'Thermocouple 4 (Standby 1)', 
      headerTooltip: 'Field: thermocouple1_standby1', // ✅ Add this
      editable: true, 
      type: 'textColumn' 
    },
    { 
      field: 'thermocouple1_standby2', 
      headerName: 'Thermocouple 5 (Standby 2)', 
      headerTooltip: 'Field: thermocouple1_standby2', // ✅ Add this
      editable: true, 
      type: 'textColumn' 
    },
    {
      field: 'temperature_differential',
      headerName: 'Temperature Differential 1',
      headerTooltip: 'Field: temperature_differential', // ✅ Add this
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

  const addHeaderTooltips = (columnDefs) => {
    return columnDefs.map(col => ({
      ...col,
      headerTooltip: `Field: ${col.field}` // ✅ Automatically add field name as tooltip
    }));
  };

  const onDataImported = ({ data, columnDefs: cols }) => {
    setRowData(data);
    setColumnDefs(addHeaderTooltips(cols)); // ✅ Add tooltips automatically
    setSelectedColumns1([]);
    setShowChart1(false);
    setSelectedColumns2([]);
    setShowChart2(false);
  };

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

  const getChartData = (selectedCols) => {
    if (selectedCols.length === 0) return [];
    return rowData.map((row) => {
      const chartRow = {};
      const keys = Object.keys(row || {});
      const firstKey = keys.length ? keys[0] : null;
      let firstVal = firstKey ? row[firstKey] : undefined;

      let name = "";
      if (firstVal !== undefined && firstVal !== null) {
        const trimmed = String(firstVal).trim();
        if (trimmed !== "") {
          const num = Number(trimmed);
          if (!Number.isNaN(num) && Number.isInteger(num)) {
            name = `Day ${num}`;
          }
        }
      }
      chartRow.name = name;

      selectedCols.forEach(col => {
        let value = row[col];
        if ((value === undefined || value === null) && columnDefs) {
          const columnDef = columnDefs.find(c => c.field === col);
          if (columnDef && columnDef.valueGetter) {
            try {
              value = columnDef.valueGetter({ data: row });
            } catch (err) {
              value = 0;
            }
          }
        }
        const n = parseFloat(value);
        chartRow[col] = Number.isFinite(n) ? n : 0;
      });

      return chartRow;
    });
  };

  const exportChartAsImage = async (chartRef) => {
    const container = chartRef.current;
    if (!container) {
      console.warn("Chart container not found");
      return null;
    }

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#FFFFFF',
        scale: 4,
        logging: false,
        useCORS: true,
        width: container.offsetWidth,
        height: container.offsetHeight,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });
      
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      console.log("Chart exported successfully with html2canvas");
      return dataUrl;
    } catch (error) {
      console.error("Error during html2canvas conversion:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      const chart1Image = await exportChartAsImage(chart1Ref);
      const chart2Image = await exportChartAsImage(chart2Ref);

      const req_body = {
        token:token,
        columns: columnDefs,
        rows: rowData,
        chart1: chart1Image,
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
      window.location.href = 'http://localhost:8069/web'
    //   const data = await resp.json();
    //   console.log("Response:", data);
    //   return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Temperature Monitoring Dashboard</h1>
          <p className={styles.subtitle}>Manage and analyze temperature data with visual insights</p>
        </div>
        <WordReport 
          rows={rowData} 
          columns={columnDefs}
          getChart1Image={() => exportChartAsImage(chart1Ref)}
          getChart2Image={() => exportChartAsImage(chart2Ref)}
        />
      </div>

      {/* Data Import Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>📂 Data Import</h3>
          <p className={styles.cardDescription}>Import your Excel data to get started</p>
        </div>
        <div className={styles.cardContent}>
          <ExcelImporter onDataImported={onDataImported} />
        </div>
      </div>

      {/* Column Management Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>⚙️ Column Management</h3>
          <p className={styles.cardDescription}>Add, edit, or remove data columns</p>
        </div>
        <div className={styles.cardContent}>
          <ColumnManager 
            columnDefs={columnDefs}
            onColumnAdded={onColumnAdded}
            onColumnUpdated={onColumnUpdated}
          />
        </div>
      </div>

      {/* Chart Configuration Section */}
      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📊 Chart 1 Configuration</h3>
            <p className={styles.cardDescription}>Select columns for the first chart</p>
          </div>
          <div className={styles.cardContent}>
            <ColumnSelector
              columnDefs={columnDefs}
              onColumnsSelected={(cols) => {
                setSelectedColumns1(cols);
                setShowChart1(cols.length > 0);
              }}
            />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📈 Chart 2 Configuration</h3>
            <p className={styles.cardDescription}>Select columns for the second chart</p>
          </div>
          <div className={styles.cardContent}>
            <ColumnSelector
              columnDefs={columnDefs}
              onColumnsSelected={(cols) => {
                setSelectedColumns2(cols);
                setShowChart2(cols.length > 0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Grid Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>📋 Data Table</h3>
          <p className={styles.cardDescription}>View and edit your temperature data</p>
        </div>
        <div className={styles.cardContent}>
          <button onClick={addRow} className={styles.addButton}>
            ➕ Add Row
          </button>
          <DataGrid
            rowData={rowData}
            columnDefs={columnDefs}
            onCellValueChanged={onCellValueChanged}
            onGridReady={onGridReady}
          />
        </div>
      </div>

      {/* Charts Section */}
      {(showChart1 || showChart2) && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📉 Visual Analytics</h3>
            <p className={styles.cardDescription}>Interactive temperature trend charts</p>
          </div>
          <div className={styles.cardContent}>
            {showChart1 && (
              <div className={styles.chartWrapper}>
                <h4 className={styles.chartLabel}>Chart 1</h4>
                <LineCharts
                  ref={chart1Ref}
                  data={getChartData(selectedColumns1)}
                  selectedColumns={selectedColumns1}
                  showChart={showChart1}
                />
              </div>
            )}

            {showChart2 && (
              <div className={styles.chartWrapper}>
                <h4 className={styles.chartLabel}>Chart 2</h4>
                <LineCharts
                  ref={chart2Ref}
                  data={getChartData(selectedColumns2)}
                  selectedColumns={selectedColumns2}
                  showChart={showChart2}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className={styles.submitSection}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          🚀 Submit Data
        </button>
      </div>
    </div>
  );
};

export default TemperatureMonitoring;
