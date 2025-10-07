import React from "react";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

export default function WordReport({ columns, rows }) {
  const generateDoc = () => {
    // 1️⃣ Create the header row
    console.log("Columns", columns);
    console.log("Rows", rows);

    // 🔧 NEW: Group columns into chunks of 7
    const chunkSize = 7;
    const columnGroups = [];
    for (let i = 0; i < columns.length; i += chunkSize) {
      columnGroups.push(columns.slice(i, i + chunkSize));
    }

    // 🔧 NEW: Create a table for each group of columns
    const tables = columnGroups.map((groupColumns) => {
      // Header row for this group
      const groupHeaderRow = new TableRow({
        children: groupColumns.map(
          (col) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: col.headerName, bold: true })],
                }),
              ],
            })
        ),
      });

      // Data rows for this group (all rows, but only these columns)
      const groupDataRows = rows.map(
        (row) =>
          new TableRow({
            children: groupColumns.map(
              (col) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: String(row[col.field] ?? ""),
                        }),
                      ],
                    }),
                  ],
                })
            ),
          })
      );

      // Table for this group
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [groupHeaderRow, ...groupDataRows],
      });
    });

    // 2️⃣ Create the document with all tables
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Temperature Monitoring",
              heading: "Heading1",
            }),
            new Paragraph(" "),
            // 🔧 NEW: Add all tables, separated by a blank paragraph
            ...tables.flatMap((table, index) => [
              table,
              index < tables.length - 1 ? new Paragraph(" ") : null, // No extra space after last table
            ]).filter(Boolean), // Remove nulls
          ],
        },
      ],
    });

    // 3️⃣ Export as Word file
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "report.docx");
    });
  };

  return (
    <button
      onClick={generateDoc}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Generate Word
    </button>
  );
}