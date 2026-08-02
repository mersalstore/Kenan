/**
 * Word Generator Utility for Kanan Safety ERP
 * Enables exporting Contracts, Quotations, and Reports to Microsoft Word (.docx)
 * so users can freely edit, type, format, and customize text in Microsoft Word.
 */

export function downloadWordDocument(htmlContent: string, fileName: string) {
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
        xmlns:w='urn:schemas-microsoft-com:office:word' 
        xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${fileName}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForCustomXLS/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 216mm 279mm;
              margin: 20mm 15mm 20mm 15mm;
              mso-header-margin: 10mm;
              mso-footer-margin: 10mm;
            }
            body {
              font-family: 'Cairo', 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
              direction: rtl;
              text-align: right;
              color: #000000;
              font-size: 11pt;
              line-height: 1.6;
            }
            h1, h2, h3, h4 {
              color: #000000;
              font-weight: bold;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid #000000;
              padding: 6pt 8pt;
              font-size: 10pt;
              text-align: right;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
            }
            .header-title {
              background-color: #d91c24;
              color: #ffffff;
              padding: 4pt 12pt;
              font-weight: bold;
              border-radius: 4px;
              display: inline-block;
            }
            .party-box {
              border: 1px solid #000000;
              padding: 10pt;
              margin-bottom: 12pt;
              background-color: #f8fafc;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>`;

  const blob = new Blob(["\ufeff" + header], {
    type: "application/msword;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".docx") ? fileName : `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

export function exportHtmlElementToWord(element: HTMLElement, filename: string) {
  // Clone element to sanitize for Word export
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove watermark overlays or buttons that don't belong in Word
  const watermarks = clone.querySelectorAll("img[alt='Official Letterhead Background'], button, .contract-modal-toolbar");
  watermarks.forEach((el) => el.remove());

  // Ensure contentEditable attributes are stripped
  const editables = clone.querySelectorAll("[contenteditable]");
  editables.forEach((el) => el.removeAttribute("contenteditable"));

  downloadWordDocument(clone.innerHTML, filename);
}
