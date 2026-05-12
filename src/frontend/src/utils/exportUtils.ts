import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

/**
 * EXPORT TO EXCEL
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * NATIVE BROWSER PRINT (Best for "Text-based" beautiful PDFs)
 * This creates a true PDF with searchable text and perfect Vietnamese support
 */
export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Clone styles from main document
  const links = document.getElementsByTagName('link');
  let styles = '';
  for (let i = 0; i < links.length; i++) {
    if (links[i].rel === 'stylesheet') {
      styles += `<link rel="stylesheet" href="${links[i].href}">`;
    }
  }
  
  const inlineStyles = document.getElementsByTagName('style');
  for (let i = 0; i < inlineStyles.length; i++) {
    styles += `<style>${inlineStyles[i].innerHTML}</style>`;
  }

  // Add some print-specific CSS to ensure background colors and full width
  styles += `
    <style>
      @media print {
        body { margin: 0; padding: 20px; }
        #print-content { width: 100% !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .no-print { display: none !important; }
      }
    </style>
  `;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>CareFirst Clinic - In tài liệu</title>
        ${styles}
      </head>
      <body>
        <div id="print-content">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => {
              window.frameElement.remove();
            }, 1000);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();
};

/**
 * EXPORT HTML ELEMENT TO PDF (Using html2canvas + jsPDF)
 * Improved version that captures full content and scales better
 */
export const exportElementToPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Show a loading indicator if needed (can be handled by caller)
    
    // Temporarily adjust element for better capture if it's scrollable
    const originalStyle = element.style.cssText;
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    // Restore original style
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    
    // A4 size in px at 72dpi: [595.28, 841.89]
    // We'll use the canvas aspect ratio but fit it to A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Handle multi-page if height is too much
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

