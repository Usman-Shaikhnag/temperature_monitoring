import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';

const ExcelImporter = ({ onDataImported }) => {
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0];
        const rows = jsonData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] ?? '';
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

        // Add formula column if relevant
        if (headers.includes('quantity') && headers.includes('price')) {
          columnDefs.push({
            field: 'total',
            headerName: 'Total',
            editable: false,
            type: 'numericColumn',
            valueGetter: params => {
              const quantity = parseFloat(params.data?.quantity) || 0;
              const price = parseFloat(params.data?.price) || 0;
              return quantity * price;
            },
            valueFormatter: params =>
              `$${params.value?.toFixed(2) || '0.00'}`
          });

          rows.forEach(row => {
            const quantity = parseFloat(row.quantity) || 0;
            const price = parseFloat(row.price) || 0;
            row.total = quantity * price;
          });
        }

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
