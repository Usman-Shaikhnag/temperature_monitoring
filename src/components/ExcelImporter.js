import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';

const ExcelImporter = ({ onDataImported }) => {
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });

      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      if (jsonData.length > 0) {
        const headers = jsonData[0];

        // ✅ Handle merged cells in the first column
        let lastValue = null;
        const rows = jsonData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            let value = row[index] ?? '';

            // Fill down for first column
            if (index === 0) {
              if (value === '') {
                value = lastValue;
              } else {
                lastValue = value;
              }
            }

            obj[header] = value;
          });
          return obj;
        });

        // ColumnDefs
        const columnDefs = headers.map(header => ({
          field: header,
          headerName: header,
          editable: true,
          flex: 1,
          type: !isNaN(parseFloat(rows[0]?.[header])) ? 'numericColumn' : 'textColumn'
        }));

        onDataImported({ data: rows, columnDefs });
      }
    };

    reader.readAsArrayBuffer(file);
  }, [onDataImported]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      <label style={{ marginLeft: '10px' }}>Upload Excel file</label>
    </div>
  );
};

export default ExcelImporter;
