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
 * EXPORT HTML ELEMENT TO PDF (Using html2canvas)
 * Good for complex layouts like tickets or reports with styles
 */
export const exportElementToPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

/**
 * EXPORT APPOINTMENT TICKET (Specific for patient)
 */
export const exportAppointmentTicket = async (appointmentId: string) => {
  // Usually we would find the element or create a hidden one
  await exportElementToPDF('appointment-ticket', `Phieu-Hen-${appointmentId.substring(0, 8)}`);
};

/**
 * EXPORT MEDICAL RECORD (Specific for patient/doctor)
 */
export const exportMedicalRecord = async (recordId: string) => {
  await exportElementToPDF('medical-record-detail', `Ket-Qua-Kham-${recordId.substring(0, 8)}`);
};
