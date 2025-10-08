import React, { useState } from "react";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

export default function WordReport({ columns, rows, getChart1Image, getChart2Image }) {
  // ✅ Add loading state
  const [isGenerating, setIsGenerating] = useState(false);
  
  const base64ToUint8Array = (base64) => {
    try {
      const base64Data = base64.split(",")[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return bytes;
    } catch (error) {
      console.error("Error converting base64 to Uint8Array:", error);
      return null;
    }
  };

  const generateDoc = async () => {
    // ✅ Set loading state to true
    setIsGenerating(true);
    
    try {
      console.log("Generating Word document...");
      
      // ✅ Wait for charts to render
      console.log("Waiting for charts to render...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ✅ Capture charts
      console.log("Capturing charts...");
      const chart1Image = getChart1Image ? await getChart1Image() : null;
      await new Promise(resolve => setTimeout(resolve, 300));
      const chart2Image = getChart2Image ? await getChart2Image() : null;
      
      console.log("Chart 1 Image:", chart1Image ? `Generated (${chart1Image.length} chars)` : "Not available");
      console.log("Chart 2 Image:", chart2Image ? `Generated (${chart2Image.length} chars)` : "Not available");

      const chunkSize = 7;
      const columnGroups = [];
      for (let i = 0; i < columns.length; i += chunkSize) {
        columnGroups.push(columns.slice(i, i + chunkSize));
      }

      const tables = columnGroups.map((groupColumns) => {
        const headerRow = new TableRow({
          children: groupColumns.map(
            (col) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ 
                        text: col.headerName, 
                        bold: true,
                        size: 20,
                      })
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: {
                  fill: "D9E1F2",
                },
              })
          ),
        });

        const dataRows = rows.map(
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
                            size: 20,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  })
              ),
            })
        );

        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows],
          margins: {
            top: 100,
            bottom: 100,
            right: 100,
            left: 100,
          },
        });
      });

      const children = [
        new Paragraph({
          text: "Temperature Monitoring Report",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: "Data Table",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        ...tables.flatMap((table, index) => [
          table,
          index < tables.length - 1 ? new Paragraph(" ") : null,
        ]).filter(Boolean),
        new Paragraph({ text: "", spacing: { after: 400 } }),
      ];

      if (chart1Image) {
        const imageData = base64ToUint8Array(chart1Image);
        if (imageData) {
          children.push(
            new Paragraph({ 
              text: "Chart 1", 
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 } 
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 1000,
                    height: 350,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "", spacing: { after: 400 } })
          );
        }
      }

      if (chart2Image) {
        const imageData = base64ToUint8Array(chart2Image);
        if (imageData) {
          children.push(
            new Paragraph({ 
              text: "Chart 2", 
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 } 
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 1000,
                    height: 350,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "", spacing: { after: 200 } })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children,
          },
        ],
      });

      console.log("Creating document blob...");
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "Temperature_Monitoring_Report.docx");
      console.log("Document generated successfully!");
      
    } catch (error) {
      console.error("Error generating document:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      // ✅ Reset loading state
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateDoc}
      disabled={isGenerating} // ✅ Disable while generating
      style={{
        padding: '10px 20px',
        backgroundColor: isGenerating ? '#94a3b8' : '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: isGenerating ? 0.7 : 1,
        transition: 'all 0.3s ease',
      }}
      onMouseOver={(e) => {
        if (!isGenerating) e.target.style.backgroundColor = '#1d4ed8';
      }}
      onMouseOut={(e) => {
        if (!isGenerating) e.target.style.backgroundColor = '#2563eb';
      }}
    >
      {/* ✅ Show spinner when generating */}
      {isGenerating ? (
        <>
          <svg 
            style={{
              animation: 'spin 1s linear infinite',
              width: '16px',
              height: '16px',
            }}
            viewBox="0 0 24 24"
          >
            <circle
              style={{
                opacity: 0.25,
              }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              style={{
                opacity: 0.75,
              }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Generating Report...</span>
        </>
      ) : (
        <>
          📄 Generate Word Report
        </>
      )}
      
      {/* ✅ Add CSS animation for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
}
